import { create } from "zustand";
import {
  isPeriod,
  isPlanId,
  isPromo,
  isProtocol,
  SERVERS,
  type Period,
  type PlanId,
  type Protocol,
} from "@/lib/catalog";

const STORAGE_KEY = "rknvpn-prefs-v1";

interface SavedPrefs {
  sfx: boolean;
  protocol: Protocol;
  serverId: string;
  plan: PlanId;
  period: Period;
  promo: string;
  uuid: string;
}

interface VpnState extends SavedPrefs {
  hydrated: boolean;
  connected: boolean;
  connectedAt: number | null;
  hydrate: () => void;
  setSfx: (value: boolean) => void;
  setProtocol: (value: Protocol) => void;
  setServerId: (value: string) => void;
  setPlan: (value: PlanId) => void;
  setPeriod: (value: Period) => void;
  setPromo: (value: string) => void;
  connect: () => void;
  disconnect: () => void;
}

function emptyPrefs(): SavedPrefs {
  return {
    sfx: true,
    protocol: "vless",
    serverId: SERVERS[0].id,
    plan: "phantom",
    period: 1,
    promo: "",
    uuid: "",
  };
}

function readPrefs(): Partial<SavedPrefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<SavedPrefs>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePrefs(prefs: SavedPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function sanitize(input: Partial<SavedPrefs>, fallbackUuid: string): SavedPrefs {
  const base = emptyPrefs();
  return {
    sfx: input.sfx !== false,
    protocol: typeof input.protocol === "string" && isProtocol(input.protocol) ? input.protocol : base.protocol,
    serverId:
      typeof input.serverId === "string" && SERVERS.some((node) => node.id === input.serverId)
        ? input.serverId
        : base.serverId,
    plan: typeof input.plan === "string" && isPlanId(input.plan) ? input.plan : base.plan,
    period: typeof input.period === "number" && isPeriod(input.period) ? input.period : base.period,
    promo: typeof input.promo === "string" ? input.promo.slice(0, 32) : "",
    uuid: typeof input.uuid === "string" && input.uuid.length > 8 ? input.uuid : fallbackUuid,
  };
}

export const useVpn = create<VpnState>((set, get) => ({
  ...emptyPrefs(),
  hydrated: false,
  connected: false,
  connectedAt: null,
  hydrate: () => {
    if (get().hydrated) return;
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "00000000-0000-4000-8000-000000000000";
    const prefs = sanitize(readPrefs(), uuid);
    writePrefs(prefs);
    set({ ...prefs, hydrated: true });
  },
  setSfx: (sfx) => {
    set({ sfx });
    persist(get());
  },
  setProtocol: (protocol) => {
    set({ protocol });
    persist(get());
  },
  setServerId: (serverId) => {
    set({ serverId });
    persist(get());
  },
  setPlan: (plan) => {
    set({ plan });
    persist(get());
  },
  setPeriod: (period) => {
    set({ period });
    persist(get());
  },
  setPromo: (promo) => {
    set({ promo });
    persist(get());
  },
  connect: () => set({ connected: true, connectedAt: Date.now() }),
  disconnect: () => set({ connected: false, connectedAt: null }),
}));

function persist(state: VpnState) {
  if (!state.hydrated) return;
  writePrefs({
    sfx: state.sfx,
    protocol: state.protocol,
    serverId: state.serverId,
    plan: state.plan,
    period: state.period,
    promo: state.promo,
    uuid: state.uuid,
  });
}

export function promoActive(code: string): boolean {
  return isPromo(code);
}
