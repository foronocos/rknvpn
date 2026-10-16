class SoundEngine {
  private ctx: AudioContext | null = null;
  enabled = true;

  setEnabled(value: boolean) {
    this.enabled = value;
    if (value) this.unlock();
  }

  unlock() {
    this.context();
  }

  private context(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!this.ctx) this.ctx = new Ctx();
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  playClick() {
    const ctx = this.context();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1080 + Math.random() * 280, t);
    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playActivate() {
    const ctx = this.context();
    if (!ctx) return;
    const t = ctx.currentTime;
    [196, 247, 294, 392].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.07, t + 0.05 + index * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }
}

export const sound = new SoundEngine();
