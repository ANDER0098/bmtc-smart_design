/* ============================================================
   SYNTHESIZED SFX ENGINE — Web Audio API (zero external assets)
   ============================================================ */

let audioCtx: AudioContext | null = null;
let soundMuted: boolean = false;

if (typeof window !== "undefined") {
  try {
    soundMuted = localStorage.getItem("bmtc_sound_muted") === "true";
  } catch {
    soundMuted = false;
  }
}

export function isAudioMuted(): boolean {
  return soundMuted;
}

export function setAudioMuted(val: boolean) {
  soundMuted = val;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bmtc_sound_muted", String(val));
    } catch {
      // ignore
    }
  }
}

export function toggleAudioMuted(): boolean {
  setAudioMuted(!soundMuted);
  return soundMuted;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

export type SfxType =
  | "tap" // fare tile / soft selection
  | "pop" // pax count bounce
  | "motor" // thermal printer feed
  | "success" // ticket confirmed chime
  | "whoosh" // slide / screen transition
  | "error" // edge case alert
  | "chime" // pass validated
  | "horn" // dual-tone BMTC bus air horn
  | "race_start" // starting gun / whistle
  | "disco"; // easter egg celebration

export function playSfx(type: SfxType) {
  if (soundMuted) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    const tone = (
      wave: OscillatorType,
      f0: number,
      f1: number | null,
      dur: number,
      vol: number,
      at = 0
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(f0, now + at);
      if (f1 !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), now + at + dur);
      gain.gain.setValueAtTime(vol, now + at);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + at + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + dur + 0.02);
    };

    switch (type) {
      case "tap":
        tone("triangle", 640, 160, 0.045, 0.32);
        break;
      case "pop":
        tone("sine", 320, 880, 0.09, 0.38);
        break;
      case "motor": {
        // sawtooth rumble + rhythmic feed ticks with speed ramp
        tone("sawtooth", 160, 240, 1.25, 0.16);
        for (let i = 0; i < 9; i++) {
          tone("square", 920 - i * 15, 680, 0.025, 0.04, i * 0.13);
        }
        break;
      }
      case "success":
        tone("sine", 523.25, null, 0.14, 0.26, 0);
        tone("sine", 659.25, null, 0.16, 0.26, 0.09);
        tone("sine", 783.99, null, 0.22, 0.22, 0.18);
        break;
      case "whoosh":
        tone("sine", 240, 90, 0.22, 0.12);
        break;
      case "error":
        tone("square", 220, 130, 0.18, 0.16);
        tone("square", 180, 110, 0.2, 0.14, 0.16);
        break;
      case "chime":
        tone("sine", 880, null, 0.12, 0.2, 0);
        tone("sine", 1174.66, null, 0.18, 0.18, 0.1);
        break;
      case "horn": {
        // Dual-tone heavy diesel bus air horn: 370Hz + 440Hz with brass harmonics
        tone("sawtooth", 370, 365, 0.35, 0.28, 0);
        tone("sawtooth", 440, 435, 0.35, 0.25, 0);
        tone("square", 740, 730, 0.35, 0.08, 0);
        // Second blast
        tone("sawtooth", 370, 365, 0.45, 0.3, 0.4);
        tone("sawtooth", 440, 435, 0.45, 0.27, 0.4);
        tone("square", 740, 730, 0.45, 0.09, 0.4);
        break;
      }
      case "race_start": {
        // Triple countdown beeps + high race start horn
        tone("sine", 440, null, 0.1, 0.2, 0);
        tone("sine", 440, null, 0.1, 0.2, 0.3);
        tone("sine", 880, 1320, 0.35, 0.35, 0.6);
        break;
      }
      case "disco": {
        // Funky synthesizer arpeggio
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
          tone("triangle", f, f * 1.5, 0.12, 0.2, i * 0.08);
        });
        break;
      }
    }
  } catch {
    /* audio is best-effort */
  }
}
