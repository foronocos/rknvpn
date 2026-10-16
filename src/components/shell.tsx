import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { sound } from "@/lib/sound";
import { useVpn } from "@/lib/vpn-store";

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const sfx = useVpn((state) => state.sfx);
  const setSfx = useVpn((state) => state.setSfx);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="soft-glow text-lg font-semibold tracking-wide text-fg">
            RKNVPN
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/" current={pathname === "/"}>
              Главная
            </NavLink>
            <NavLink href="/console" current={pathname.startsWith("/console")}>
              Консоль
            </NavLink>
          </nav>
          <button
            type="button"
            className="tap flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-medium tracking-wide text-fg"
            aria-pressed={sfx}
            onClick={() => {
              const next = !sfx;
              setSfx(next);
              sound.setEnabled(next);
              if (next) sound.playClick();
            }}
          >
            <span className="font-mono">SFX: {sfx ? "ON" : "OFF"}</span>
            <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
              <span className={sfx ? "eq-bar" : "eq-bar eq-off"} />
              <span className={sfx ? "eq-bar" : "eq-bar eq-off"} />
              <span className={sfx ? "eq-bar" : "eq-bar eq-off"} />
              <span className={sfx ? "eq-bar" : "eq-bar eq-off"} />
            </span>
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

function NavLink({ href, current, children }: { href: "/" | "/console"; current: boolean; children: string }) {
  return (
    <Link
      to={href}
      className={
        current
          ? "rounded-lg px-3 py-2 text-cyan"
          : "rounded-lg px-3 py-2 text-muted transition-colors duration-200 hover:text-fg"
      }
      aria-current={current ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
