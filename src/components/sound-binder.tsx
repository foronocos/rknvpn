import { useEffect } from "react";
import { sound } from "@/lib/sound";
import { useVpn } from "@/lib/vpn-store";

export function SoundBinder() {
  const hydrate = useVpn((state) => state.hydrate);
  const sfx = useVpn((state) => state.sfx);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    sound.setEnabled(sfx);
  }, [sfx]);

  useEffect(() => {
    const unlock = () => sound.unlock();
    const onOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const current = target.closest("button, a");
      if (!current) return;
      const from = event.relatedTarget instanceof Element ? event.relatedTarget.closest("button, a") : null;
      if (from === current) return;
      sound.playClick();
    };
    window.addEventListener("pointerdown", unlock);
    document.addEventListener("pointerover", onOver);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return null;
}
