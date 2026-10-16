export function burstConfetti() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.createElement("div");
  root.className = "pointer-events-none fixed inset-0 z-50 overflow-hidden";
  const colors = ["var(--color-cyan)", "var(--color-magenta)", "var(--color-fg)"];
  for (let index = 0; index < 36; index += 1) {
    const bit = document.createElement("span");
    bit.className = "confetti-bit";
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[index % colors.length] ?? colors[0];
    bit.style.animationDelay = `${Math.random() * 120}ms`;
    bit.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
    root.appendChild(bit);
  }
  document.body.appendChild(root);
  window.setTimeout(() => root.remove(), 1400);
}
