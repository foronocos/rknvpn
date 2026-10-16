import { useEffect, useRef } from "react";

const INK = "#07110f";
const CYAN = "#2ee6d6";

type Draw = (
  canvas: HTMLCanvasElement,
  text: string,
  options?: {
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  },
) => Promise<void>;

export function QrMark({ value }: { value: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !value) return;
    let cancel = false;
    void import("qrcode").then((mod) => {
      const bag = mod as unknown as {
        toCanvas?: Draw;
        default?: { toCanvas?: Draw };
      };
      const draw = bag.toCanvas ?? bag.default?.toCanvas;
      if (cancel || !ref.current || !draw) return;
      void draw(ref.current, value, {
        margin: 1,
        width: 220,
        color: { dark: INK, light: CYAN },
      });
    });
    return () => {
      cancel = true;
    };
  }, [value]);

  return (
    <canvas
      ref={ref}
      width={220}
      height={220}
      className="mx-auto rounded-xl border border-cyan"
      aria-label="QR-код строки подключения"
    />
  );
}
