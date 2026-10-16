import { useEffect, useRef, useState } from "react";

export function RollingPrice({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const startValue = from.current;
    const endValue = value;
    if (startValue === endValue) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      from.current = endValue;
      setShown(endValue);
      return;
    }
    const started = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / 680);
      const eased = 1 - (1 - progress) ** 4;
      setShown(Math.round(startValue + (endValue - startValue) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
      else from.current = endValue;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{shown}</span>;
}
