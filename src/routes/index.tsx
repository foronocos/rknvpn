import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Shield, Wind, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { RollingPrice } from "@/components/rolling-price";
import { Shell } from "@/components/shell";
import { PLANS, PERIODS, isPromo, planPrice, type Period } from "@/lib/catalog";
import { burstConfetti } from "@/lib/confetti";
import { sound } from "@/lib/sound";
import { useVpn } from "@/lib/vpn-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "RKNVPN — щит в матрице" }],
  }),
  component: Home,
});

function Home() {
  const period = useVpn((state) => state.period);
  const promo = useVpn((state) => state.promo);
  const setPeriod = useVpn((state) => state.setPeriod);
  const setPromo = useVpn((state) => state.setPromo);
  const [waving, setWaving] = useState(false);
  const promoOn = isPromo(promo);

  function onPromo(next: string) {
    const was = isPromo(promo);
    setPromo(next);
    if (!was && isPromo(next)) {
      setWaving(false);
      window.setTimeout(() => setWaving(true), 20);
      burstConfetti();
      sound.playActivate();
    }
  }

  return (
    <Shell>
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24">
          <p className="reveal font-mono text-xs tracking-[0.22em] text-cyan uppercase">VLESS · Hysteria2</p>
          <h1 className="reveal reveal-1 mt-4 max-w-3xl text-5xl leading-none font-semibold tracking-tight text-balance md:text-7xl">
            <span className="gradient-text">Твой щит</span>
            <br />
            в матрице
          </h1>
          <p className="reveal reveal-2 mt-6 max-w-xl text-lg text-muted">
            Консоль, которая собирает строку подключения и показывает, как канал дышит. Трафик устройства
            отсюда не уходит — это стенд, не туннель.
          </p>
          <div className="reveal reveal-3 mt-8 flex flex-wrap gap-3">
            <Link
              to="/console"
              className="tap inline-flex min-h-11 items-center rounded-xl bg-cyan px-5 font-semibold text-ink"
            >
              Открыть консоль
            </Link>
            <a
              href="#tariffs"
              className="tap inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-5 font-semibold text-fg"
            >
              Смотреть тарифы
            </a>
          </div>
        </section>

        <section id="protocols" className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
          <ProtocolCard icon={<Zap className="size-6 text-cyan" />} title="VLESS Reality" text="Маскировка под обычный HTTPS. Строка готова к импорту." />
          <ProtocolCard icon={<Wind className="size-6 text-magenta" />} title="Hysteria2" text="UDP-профиль для плохого канала. Тот же стенд, другой протокол." />
          <ProtocolCard icon={<Shield className="size-6 text-cyan" />} title="Только браузер" text="Идентификатор и настройки лежат локально. Сервер логов здесь нет." />
        </section>

        <section id="tariffs" className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Тарифы</h2>
          <p className="mt-2 max-w-xl text-muted">Период меняет цену плавно. Промокод GROK или RKNVIP снимает ещё 25%.</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  period === item.id
                    ? "tap min-h-11 rounded-xl border border-cyan bg-surface-2 px-4 font-mono text-sm text-fg"
                    : "tap min-h-11 rounded-xl border border-line bg-surface px-4 font-mono text-sm text-muted"
                }
                onClick={() => setPeriod(item.id)}
              >
                {item.label}
                {item.hint ? <span className="ml-2 text-cyan">{item.hint}</span> : null}
              </button>
            ))}
          </div>

          <label className="mt-6 block max-w-md">
            <span className="mb-2 block font-mono text-xs tracking-widest text-muted">ПРОМОКОД</span>
            <input
              value={promo}
              onChange={(event) => onPromo(event.target.value)}
              placeholder="GROK"
              autoCapitalize="characters"
              className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 font-mono tracking-widest text-fg uppercase outline-none placeholder:text-muted"
            />
            <span className="mt-2 block h-5 text-sm text-cyan">
              {promoOn ? "Секретный режим: −25%" : ""}
            </span>
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={
                  waving
                    ? `promo-wave flex flex-col rounded-2xl border bg-surface p-6 ${plan.featured ? "border-magenta" : "border-line"}`
                    : `flex flex-col rounded-2xl border bg-surface p-6 ${plan.featured ? "border-magenta" : "border-line"}`
                }
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.featured ? (
                    <span className="rounded-full bg-magenta px-2 py-1 font-mono text-[11px] font-medium text-ink">
                      ХОДОВОЙ
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 font-mono text-5xl font-medium text-fg">
                  <RollingPrice value={planPrice(plan.base, period as Period, promoOn)} />
                  <span className="text-2xl text-muted">₽</span>
                </p>
                <p className="mt-1 text-sm text-muted">{plan.devices}</p>
                <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm text-fg">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-cyan" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/console"
                  search={{ plan: plan.id }}
                  className="tap mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-cyan bg-surface-2 font-semibold text-fg"
                >
                  Собрать конфиг
                </Link>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted">
          Демо-консоль RKNVPN. Настоящий туннель из браузера не поднимается.
        </footer>
      </main>
    </Shell>
  );
}

function ProtocolCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-6">
      {icon}
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </article>
  );
}
