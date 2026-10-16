import { createFileRoute } from "@tanstack/react-router";
import { Power, Radio } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfigDialog } from "@/components/config-dialog";
import { Shell } from "@/components/shell";
import { TrafficChart, type TrafficPoint } from "@/components/traffic-chart";
import {
  SERVERS,
  buildConfig,
  isPlanId,
  isProtocol,
  planById,
  serverById,
  type PlanId,
  type Protocol,
} from "@/lib/catalog";
import { sound } from "@/lib/sound";
import { useVpn } from "@/lib/vpn-store";

type ConsoleSearch = {
  plan?: PlanId;
  protocol?: Protocol;
};

export const Route = createFileRoute("/console")({
  validateSearch: (search: Record<string, unknown>): ConsoleSearch => {
    const result: ConsoleSearch = {};
    if (typeof search.plan === "string" && isPlanId(search.plan)) result.plan = search.plan;
    if (typeof search.protocol === "string" && isProtocol(search.protocol)) result.protocol = search.protocol;
    return result;
  },
  head: () => ({
    meta: [{ title: "Консоль — RKNVPN" }],
  }),
  component: ConsolePage,
});

function ConsolePage() {
  const search = Route.useSearch();
  const hydrated = useVpn((state) => state.hydrated);
  const protocol = useVpn((state) => state.protocol);
  const serverId = useVpn((state) => state.serverId);
  const plan = useVpn((state) => state.plan);
  const uuid = useVpn((state) => state.uuid);
  const connected = useVpn((state) => state.connected);
  const connectedAt = useVpn((state) => state.connectedAt);
  const setProtocol = useVpn((state) => state.setProtocol);
  const setServerId = useVpn((state) => state.setServerId);
  const setPlan = useVpn((state) => state.setPlan);
  const connect = useVpn((state) => state.connect);
  const disconnect = useVpn((state) => state.disconnect);

  const [phase, setPhase] = useState<"idle" | "linking">("idle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [samples, setSamples] = useState<TrafficPoint[]>([]);
  const [chartReady, setChartReady] = useState(false);
  const applied = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    setChartReady(true);
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || applied.current) return;
    applied.current = true;
    if (search.plan) setPlan(search.plan);
    if (search.protocol) setProtocol(search.protocol);
    if (search.plan) setDialogOpen(true);
  }, [hydrated, search.plan, search.protocol, setPlan, setProtocol]);

  useEffect(() => {
    if (!connected) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setSamples([]);
      return;
    }
    const node = serverById(serverId);
    let previous = (1 - node.load) * 70;
    const timer = window.setInterval(() => {
      const base = (1 - node.load) * 80 + 12;
      previous = Math.max(4, previous * 0.62 + base * 0.38 + (Math.random() - 0.5) * 10);
      setSamples((current) => {
        const next = [...current, { t: Date.now(), mbps: Math.round(previous * 10) / 10 }];
        return next.slice(-24);
      });
    }, 800);
    return () => window.clearInterval(timer);
  }, [connected, serverId]);

  const node = serverById(serverId);
  const currentPlan = planById(plan);
  const uri = useMemo(() => {
    if (!uuid) return "";
    return buildConfig({
      protocol,
      uuid,
      host: node.host,
      label: `RKNVPN-${currentPlan.name}`,
    });
  }, [protocol, uuid, node.host, currentPlan.name]);

  const seconds = connected && connectedAt ? Math.max(0, Math.floor((now - connectedAt) / 1000)) : 0;
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const latest = samples.at(-1)?.mbps;

  async function toggleLink() {
    if (connected) {
      disconnect();
      setPhase("idle");
      return;
    }
    setPhase("linking");
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    if (!alive.current) return;
    connect();
    sound.playActivate();
    setPhase("idle");
  }

  return (
    <Shell>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <Radio className="size-4 text-cyan" />
            <h1 className="text-lg font-semibold">Узлы</h1>
          </div>
          <ul className="flex flex-col gap-2">
            {SERVERS.map((item) => {
              const active = item.id === serverId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      active
                        ? "tap flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-cyan bg-surface-2 px-3 text-left"
                        : "tap flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-line bg-bg px-3 text-left"
                    }
                    onClick={() => setServerId(item.id)}
                  >
                    <span>
                      <span className="block font-medium">{item.city}</span>
                      <span className="font-mono text-xs text-muted">{item.region}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-sm text-cyan">{item.ping} мс</span>
                      <span className="mt-1 block h-1.5 w-16 overflow-hidden rounded-full bg-line">
                        <span
                          className="block h-full bg-magenta"
                          style={{ width: `${Math.round(item.load * 100)}%` }}
                        />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-mono text-xs tracking-widest text-muted">ТАРИФ {currentPlan.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ProtoButton current={protocol} value="vless" label="VLESS" onPick={setProtocol} />
              <ProtoButton current={protocol} value="hy2" label="HYSTERIA2" onPick={setProtocol} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Stat label="Статус" value={connected ? "В сети" : phase === "linking" ? "Связь…" : "Тишина"} />
              <Stat label="Сессия" value={connected ? clock : "—"} />
              <Stat label="Скорость" value={connected && latest ? `${latest}` : "—"} />
            </div>
            <button
              type="button"
              className="tap mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan font-semibold text-ink disabled:opacity-60"
              disabled={phase === "linking"}
              onClick={() => void toggleLink()}
            >
              <Power className="size-4" />
              {connected ? "Разорвать канал" : phase === "linking" ? "Поднимаем канал" : "Включить канал"}
            </button>
            <p className="mt-3 text-sm text-muted">
              Узел {node.city} · {node.host}. Это анимация стенда: пакеты наружу не идут.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Поток</h2>
              <button
                type="button"
                className="tap min-h-11 rounded-xl border border-line px-3 text-sm text-fg"
                onClick={() => setDialogOpen(true)}
                disabled={!uri}
              >
                Строка и QR
              </button>
            </div>
            {chartReady ? <TrafficChart data={samples} /> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["shadow", "phantom", "ghost"] as PlanId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={
                  plan === id
                    ? "tap min-h-11 rounded-xl border border-cyan px-3 font-mono text-xs text-cyan"
                    : "tap min-h-11 rounded-xl border border-line px-3 font-mono text-xs text-muted"
                }
                onClick={() => setPlan(id)}
              >
                {planById(id).name}
              </button>
            ))}
          </div>
        </section>
      </main>
      <ConfigDialog open={dialogOpen && Boolean(uri)} onOpenChange={setDialogOpen} uri={uri} title="Конфигурация готова" />
    </Shell>
  );
}

function ProtoButton({
  current,
  value,
  label,
  onPick,
}: {
  current: Protocol;
  value: Protocol;
  label: string;
  onPick: (value: Protocol) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      className={
        active
          ? "tap min-h-11 flex-1 rounded-xl border border-cyan bg-surface-2 px-3 font-mono text-sm text-fg"
          : "tap min-h-11 flex-1 rounded-xl border border-line px-3 font-mono text-sm text-muted"
      }
      onClick={() => onPick(value)}
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg px-3 py-3">
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 font-mono text-lg text-fg">{value}</p>
    </div>
  );
}
