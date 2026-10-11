/* ============================================================
   KANNADA VOICE ENGINE — Web Speech API with synthesized fallback
   ============================================================ */

export interface VoiceAnnouncement {
  textKn: string;
  textEn: string;
}

class KannadaVoiceEngine {
  private enabled: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;
    this.voicesLoaded = true;
    // Look for Kannada voice, then Indian English, then any Indian locale
    const knVoice = voices.find(
      (v) => v.lang === "kn-IN" || v.lang.toLowerCase().startsWith("kn")
    );
    const inVoice = voices.find(
      (v) => v.lang === "en-IN" || v.lang.toLowerCase().includes("india")
    );
    this.voice = knVoice || inVoice || voices[0] || null;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (!val) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public announceFare(destKn: string, destEn: string, fare: number) {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Prefer Kannada phrasing
    const utteranceKn = `${destKn}, ${fare} ರೂಪಾಯಿ`;
    const utteranceEn = `${destEn}, ${fare} rupees`;

    const u = new SpeechSynthesisUtterance(this.voice?.lang.startsWith("kn") ? utteranceKn : utteranceEn);
    if (this.voice) u.voice = this.voice;
    u.rate = 1.05;
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }

  public announcePax(pax: number, total: number) {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utteranceKn = `${pax} ಪ್ರಯಾಣಿಕರು, ಒಟ್ಟು ${total} ರೂಪಾಯಿ`;
    const utteranceEn = `${pax} passengers, total ${total} rupees`;

    const u = new SpeechSynthesisUtterance(this.voice?.lang.startsWith("kn") ? utteranceKn : utteranceEn);
    if (this.voice) u.voice = this.voice;
    u.rate = 1.1;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }

  public announceTicketIssued(serial: string) {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utteranceKn = "ಟಿಕೆಟ್ ಮುದ್ರಣವಾಗಿದೆ. ಶುಭ ಪ್ರಯಾಣ!";
    const utteranceEn = "Ticket issued. Happy journey!";

    const u = new SpeechSynthesisUtterance(this.voice?.lang.startsWith("kn") ? utteranceKn : utteranceEn);
    if (this.voice) u.voice = this.voice;
    u.rate = 1.05;
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  }

  public speakCustom(text: string) {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }
}

export const kannadaVoice = new KannadaVoiceEngine();
