export type Protocol = "vless" | "hy2";
export type PlanId = "shadow" | "phantom" | "ghost";
export type Period = 1 | 6 | 12;

export interface ServerNode {
  id: string;
  city: string;
  region: string;
  host: string;
  ping: number;
  load: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  base: number;
  devices: string;
  perks: string[];
  featured?: boolean;
}

export const SERVERS: ServerNode[] = [
  { id: "fra", city: "Франкфурт", region: "Европа", host: "fra.edge.rknvpn.net", ping: 28, load: 0.22 },
  { id: "ams", city: "Амстердам", region: "Европа", host: "ams.edge.rknvpn.net", ping: 34, load: 0.41 },
  { id: "hel", city: "Хельсинки", region: "Европа", host: "hel.edge.rknvpn.net", ping: 41, load: 0.18 },
  { id: "sto", city: "Стокгольм", region: "Европа", host: "sto.edge.rknvpn.net", ping: 47, load: 0.33 },
  { id: "nyc", city: "Нью-Йорк", region: "Америка", host: "nyc.edge.rknvpn.net", ping: 108, load: 0.55 },
  { id: "sgp", city: "Сингапур", region: "Азия", host: "sgp.edge.rknvpn.net", ping: 164, load: 0.29 },
  { id: "tyo", city: "Токио", region: "Азия", host: "tyo.edge.rknvpn.net", ping: 186, load: 0.37 },
];

export const PLANS: Plan[] = [
  {
    id: "shadow",
    name: "SHADOW",
    base: 299,
    devices: "1 устройство",
    perks: ["VLESS Reality", "100 ГБ в месяц"],
  },
  {
    id: "phantom",
    name: "PHANTOM",
    base: 599,
    devices: "5 устройств",
    perks: ["VLESS и Hysteria2", "Безлимитный трафик"],
    featured: true,
  },
  {
    id: "ghost",
    name: "GHOST",
    base: 999,
    devices: "Без лимита устройств",
    perks: ["Приоритетный канал", "Отдельный узел"],
  },
];

export const PERIODS: { id: Period; label: string; hint: string }[] = [
  { id: 1, label: "1 мес", hint: "" },
  { id: 6, label: "6 мес", hint: "−30%" },
  { id: 12, label: "1 год", hint: "−50%" },
];

export function isPlanId(value: string): value is PlanId {
  return value === "shadow" || value === "phantom" || value === "ghost";
}

export function isProtocol(value: string): value is Protocol {
  return value === "vless" || value === "hy2";
}

export function isPeriod(value: number): value is Period {
  return value === 1 || value === 6 || value === 12;
}

export function periodFactor(period: Period): number {
  if (period === 6) return 0.7;
  if (period === 12) return 0.5;
  return 1;
}

export function isPromo(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return normalized === "GROK" || normalized === "RKNVIP";
}

export function planPrice(base: number, period: Period, promoOn: boolean): number {
  const promo = promoOn ? 0.75 : 1;
  return Math.round(base * periodFactor(period) * promo);
}

export function serverById(id: string): ServerNode {
  return SERVERS.find((node) => node.id === id) ?? SERVERS[0];
}

export function planById(id: PlanId): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[1];
}

export function buildConfig(options: {
  protocol: Protocol;
  uuid: string;
  host: string;
  label: string;
}): string {
  if (options.protocol === "vless") {
    const query = new URLSearchParams({
      encryption: "none",
      flow: "xtls-rprx-vision",
      security: "reality",
      sni: "www.microsoft.com",
      fp: "chrome",
      pbk: "demo-public-key",
      sid: "ab12cd34",
      type: "tcp",
      headerType: "none",
    });
    return `vless://${options.uuid}@${options.host}:443?${query.toString()}#${encodeURIComponent(options.label)}`;
  }
  const query = new URLSearchParams({
    sni: "www.cloudflare.com",
    obfs: "salamander",
    "obfs-password": "demo",
  });
  return `hy2://${options.uuid}@${options.host}:443?${query.toString()}#${encodeURIComponent(options.label)}`;
}
