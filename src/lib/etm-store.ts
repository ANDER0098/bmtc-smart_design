"use client";

/* ============================================================
   ETM SIMULATOR STATE MACHINE — zustand
   Comprehensive reactive store for ticketing flow, benchmark
   telemetry, environment stress dials, ledger, and presentation.
   ============================================================ */

import { create } from "zustand";
import { playSfx } from "./audio";
import { kannadaVoice } from "./voice";
import { FARE_LADDER, STAGES, type FareStop, BMTC_CONFIG } from "./config";

export type ScreenId = "home" | "count" | "success" | "pass";
export type SheetId = "gps" | "void" | "paper" | null;
export type ViewMode = "split" | "proto" | "deck";
export type DemoTarget = "fare" | "pax" | "issue" | null;
export type ChassisLivery = "chassis-matte" | "chassis-heritage" | "chassis-cyber";

export interface IssuedTicket {
  id: string;
  serial: string;
  destKn: string;
  destEn: string;
  fare: number;
  pax: number;
  total: number;
  payMode: "Cash" | "UPI" | "Pass";
  time: string;
  stage: string;
  issueTimeSecs: number;
  voided?: boolean;
}

export interface BenchmarkRun {
  id: string;
  runNumber: number;
  totalSecs: number;
  laps: [string, string, string];
  passed: boolean;
  timestamp: number;
}

// Timer registry to avoid memory leaks
class TimerRegistry {
  private intervals = new Set<ReturnType<typeof setInterval>>();
  private timeouts = new Set<ReturnType<typeof setTimeout>>();

  setInterval(fn: () => void, ms: number) {
    const id = setInterval(fn, ms);
    this.intervals.add(id);
    return id;
  }

  clearInterval(id: ReturnType<typeof setInterval> | null) {
    if (id) {
      clearInterval(id);
      this.intervals.delete(id);
    }
  }

  setTimeout(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  }

  clearTimeout(id: ReturnType<typeof setTimeout> | null) {
    if (id) {
      clearTimeout(id);
      this.timeouts.delete(id);
    }
  }

  clearAll() {
    this.intervals.forEach(clearInterval);
    this.timeouts.forEach(clearTimeout);
    this.intervals.clear();
    this.timeouts.clear();
  }
}

const timerRegistry = new TimerRegistry();
let timerInterval: ReturnType<typeof setInterval> | null = null;
let undoInterval: ReturnType<typeof setInterval> | null = null;
let autoResetTimeout: ReturnType<typeof setTimeout> | null = null;
let serialCounter = 2184;

export interface EtmState {
  /* transaction */
  fare: number;
  destKn: string;
  destEn: string;
  pax: number;
  payMode: "Cash" | "UPI" | "Pass";
  stageCode: string;
  stageName: string;
  serial: string;

  /* navigation */
  screen: ScreenId;
  sheet: SheetId;
  view: ViewMode;

  /* environment toggles & dials */
  isOffline: boolean;
  isPaperOut: boolean;
  isLedger: boolean;
  isNight: boolean;
  thumbOverlay: boolean;
  glare: boolean;
  sway: boolean;
  lefty: boolean;
  roadRoughness: number; // 0 - 100
  glareIntensity: number; // 0 - 100
  rainDroplets: boolean;
  chassisLivery: ChassisLivery;

  /* benchmark timer & history */
  timerRunning: boolean;
  timerStart: number;
  elapsedMs: number;
  lap1: string;
  lap2: string;
  lap3: string;
  benchResult: null | { total: string; passed: boolean };
  benchHistory: BenchmarkRun[];

  /* ledger transactions */
  issuedTickets: IssuedTicket[];

  /* print flow */
  issueState: "idle" | "printing";
  receiptOut: boolean;
  undoSecs: number;

  /* pro features & overlays */
  demoTarget: DemoTarget;
  spotlightElement: string | null;
  ghostReplayActive: boolean;
  bootSequenceActive: boolean;
  engineeringMode: boolean;
  konamiUnlocked: boolean;

  /* deck engine */
  currentSlide: number;
  deckArticle: boolean;

  /* actions */
  tapFare: (stop: FareStop) => void;
  setPax: (n: number) => void;
  setPayment: (m: EtmState["payMode"]) => void;
  issue: () => void;
  finishPrint: () => void;
  goHome: () => void;
  tearTicket: () => void;
  undoVoid: () => void;

  startTimer: () => void;
  recordLap: (n: 1 | 2 | 3) => void;
  stopTimer: () => void;

  toggleEnv: (
    k:
      | "isOffline"
      | "isPaperOut"
      | "isNight"
      | "thumbOverlay"
      | "glare"
      | "sway"
      | "lefty"
      | "rainDroplets"
  ) => void;
  setRoadRoughness: (n: number) => void;
  setGlareIntensity: (n: number) => void;
  setChassisLivery: (l: ChassisLivery) => void;

  openPassScreen: () => void;
  openSheet: (s: Exclude<SheetId, null>) => void;
  closeSheet: () => void;
  pickStage: (code: string, name: string) => void;
  confirmVoid: (reason: string) => void;
  enableLedger: () => void;
  holdVoidTick: () => void;
  runAutoDemo: () => void;
  setView: (v: ViewMode) => void;
  goToSlide: (n: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  toggleDeckMode: () => void;

  setSpotlightElement: (el: string | null) => void;
  setGhostReplayActive: (v: boolean) => void;
  triggerBootSequence: () => void;
  toggleEngineeringMode: () => void;
  unlockKonami: () => void;
}

export const useEtm = create<EtmState>((set, get) => ({
  fare: 18,
  destKn: "ಮಾದಿವಾಳ",
  destEn: "Madiwala",
  pax: 3,
  payMode: "Cash",
  stageCode: "ST-12",
  stageName: "Koramangala",
  serial: "335E-002184",

  screen: "home",
  sheet: null,
  view: "split",

  isOffline: false,
  isPaperOut: false,
  isLedger: false,
  isNight: false,
  thumbOverlay: true,
  glare: false,
  sway: false,
  lefty: false,
  roadRoughness: 25,
  glareIntensity: 40,
  rainDroplets: false,
  chassisLivery: "chassis-matte",

  timerRunning: false,
  timerStart: 0,
  elapsedMs: 0,
  lap1: "--",
  lap2: "--",
  lap3: "--",
  benchResult: null,
  benchHistory: [
    {
      id: "run-init-1",
      runNumber: 1,
      totalSecs: 3.42,
      laps: ["0.48", "1.12", "3.42"],
      passed: true,
      timestamp: Date.now() - 360000,
    },
    {
      id: "run-init-2",
      runNumber: 2,
      totalSecs: 3.18,
      laps: ["0.42", "1.05", "3.18"],
      passed: true,
      timestamp: Date.now() - 180000,
    },
  ],

  issuedTickets: [
    {
      id: "tkt-0",
      serial: "335E-002184",
      destKn: "ಮಾದಿವಾಳ",
      destEn: "Madiwala",
      fare: 18,
      pax: 3,
      total: 54,
      payMode: "Cash",
      time: "14:32",
      stage: "Koramangala",
      issueTimeSecs: 3.18,
    },
  ],

  issueState: "idle",
  receiptOut: false,
  undoSecs: 8,

  demoTarget: null,
  spotlightElement: null,
  ghostReplayActive: false,
  bootSequenceActive: false,
  engineeringMode: false,
  konamiUnlocked: false,

  currentSlide: 1,
  deckArticle: false,

  /* ---------------- benchmark ---------------- */
  startTimer: () => {
    if (timerInterval) timerRegistry.clearInterval(timerInterval);
    set({
      timerRunning: true,
      timerStart: performance.now(),
      elapsedMs: 0,
      lap1: "--",
      lap2: "--",
      lap3: "--",
      benchResult: null,
    });
    timerInterval = timerRegistry.setInterval(() => {
      set({ elapsedMs: performance.now() - get().timerStart });
    }, 31);
  },

  recordLap: (n) => {
    if (!get().timerRunning) return;
    const t = ((performance.now() - get().timerStart) / 1000).toFixed(2);
    if (n === 1) set({ lap1: t });
    if (n === 2) set({ lap2: t });
    if (n === 3) set({ lap3: t });
  },

  stopTimer: () => {
    if (!get().timerRunning) return;
    if (timerInterval) timerRegistry.clearInterval(timerInterval);
    timerInterval = null;
    get().recordLap(3);
    const total = ((performance.now() - get().timerStart) / 1000).toFixed(2);
    const totalNum = parseFloat(total);
    const passed = totalNum <= BMTC_CONFIG.timings.benchmarkTargetSecs;

    const newRun: BenchmarkRun = {
      id: `run-${Date.now()}`,
      runNumber: get().benchHistory.length + 1,
      totalSecs: totalNum,
      laps: [get().lap1, get().lap2, total],
      passed,
      timestamp: Date.now(),
    };

    set({
      timerRunning: false,
      benchResult: { total, passed },
      benchHistory: [...get().benchHistory, newRun],
    });
  },

  /* ---------------- ticketing flow ---------------- */
  tapFare: (stop) => {
    playSfx("tap");
    kannadaVoice.announceFare(stop.kn, stop.en, stop.fare);
    get().startTimer();
    get().recordLap(1);
    set({
      fare: stop.fare,
      destKn: stop.kn,
      destEn: stop.en.replace(" ★", ""),
      screen: "count",
      sheet: null,
    });
  },

  setPax: (n) => {
    playSfx("pop");
    const total = get().fare * n;
    kannadaVoice.announcePax(n, total);
    get().recordLap(2);
    set({ pax: n });
  },

  setPayment: (m) => {
    playSfx("tap");
    if (m === "Pass") {
      get().openPassScreen();
      return;
    }
    set({ payMode: m });
  },

  issue: () => {
    const s = get();
    if (s.isPaperOut) {
      playSfx("error");
      set({ sheet: "paper" });
      return;
    }
    playSfx("motor");
    s.stopTimer();
    serialCounter += 7;
    const newSerial = `335E-00${serialCounter}`;

    const newTicket: IssuedTicket = {
      id: `tkt-${Date.now()}`,
      serial: newSerial,
      destKn: s.destKn,
      destEn: s.destEn,
      fare: s.fare,
      pax: s.pax,
      total: s.fare * s.pax,
      payMode: s.payMode,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      stage: s.stageName,
      issueTimeSecs: parseFloat(s.benchResult?.total || "3.2"),
    };

    set({
      issueState: "printing",
      serial: newSerial,
      issuedTickets: [newTicket, ...s.issuedTickets],
    });

    timerRegistry.setTimeout(() => get().finishPrint(), BMTC_CONFIG.timings.printDurationMs);
  },

  finishPrint: () => {
    playSfx("success");
    kannadaVoice.announceTicketIssued(get().serial);
    set({ issueState: "idle", receiptOut: true, screen: "success", undoSecs: 8 });

    if (undoInterval) timerRegistry.clearInterval(undoInterval);
    undoInterval = timerRegistry.setInterval(() => {
      const u = get().undoSecs;
      if (u <= 1) {
        timerRegistry.clearInterval(undoInterval);
        undoInterval = null;
        set({ undoSecs: 0 });
      } else set({ undoSecs: u - 1 });
    }, 1000);

    if (autoResetTimeout) timerRegistry.clearTimeout(autoResetTimeout);
    autoResetTimeout = timerRegistry.setTimeout(
      () => get().goHome(),
      BMTC_CONFIG.timings.autoResetDelayMs
    );
  },

  goHome: () => {
    timerRegistry.clearAll();
    timerInterval = null;
    undoInterval = null;
    autoResetTimeout = null;
    set({
      screen: "home",
      issueState: "idle",
      receiptOut: false,
      undoSecs: 8,
      sheet: null,
      timerRunning: false,
    });
  },

  tearTicket: () => {
    playSfx("tap");
    set({ receiptOut: false });
  },

  undoVoid: () => {
    playSfx("tap");
    // Mark last ticket as voided
    const tickets = [...get().issuedTickets];
    if (tickets.length > 0) {
      tickets[0] = { ...tickets[0], voided: true };
    }
    timerRegistry.clearAll();
    set({
      screen: "home",
      receiptOut: false,
      undoSecs: 8,
      issuedTickets: tickets,
    });
  },

  /* ---------------- edge cases & stress dials ---------------- */
  toggleEnv: (k) => {
    playSfx("tap");
    const cur = get()[k];
    set({ [k]: !cur } as Partial<EtmState>);
  },

  setRoadRoughness: (n) => {
    set({ roadRoughness: n, sway: n > 0 });
    if (typeof document !== "undefined") {
      const deg = (1.2 + (n / 100) * 3.6).toFixed(1);
      const px = (3 + (n / 100) * 10).toFixed(0);
      document.documentElement.style.setProperty("--sway-deg", `${deg}deg`);
      document.documentElement.style.setProperty("--sway-x", `${px}px`);
    }
  },

  setGlareIntensity: (n) => {
    set({ glareIntensity: n, glare: n > 0 });
  },

  setChassisLivery: (l) => set({ chassisLivery: l }),

  openPassScreen: () => {
    playSfx("tap");
    get().stopTimer();
    set({ screen: "pass" });
  },

  openSheet: (s) => {
    playSfx("tap");
    set({ sheet: s });
  },

  closeSheet: () => set({ sheet: null }),

  pickStage: (code, name) => {
    playSfx("chime");
    set({ stageCode: code, stageName: name, sheet: null });
  },

  confirmVoid: (reason) => {
    playSfx("error");
    set({ sheet: null });
    get().goHome();
    return reason;
  },

  enableLedger: () => {
    playSfx("chime");
    set({ isLedger: true, isPaperOut: false, sheet: null });
  },

  holdVoidTick: () => {
    playSfx("tap");
  },

  /* ---------------- auto demo ---------------- */
  runAutoDemo: () => {
    timerRegistry.clearAll();
    get().goHome();
    set({ demoTarget: null, view: get().view === "deck" ? "proto" : get().view });

    timerRegistry.setTimeout(() => {
      set({ demoTarget: "fare" });
      get().tapFare({ fare: 18, kn: "ಮಾದಿವಾಳ", en: "Madiwala" });
      timerRegistry.setTimeout(() => set({ demoTarget: null }), 260);
    }, 500);

    timerRegistry.setTimeout(() => {
      set({ demoTarget: "pax" });
      get().setPax(3);
      timerRegistry.setTimeout(() => set({ demoTarget: null }), 260);
    }, 1650);

    timerRegistry.setTimeout(() => {
      set({ demoTarget: "issue" });
      get().issue();
      timerRegistry.setTimeout(() => set({ demoTarget: null }), 400);
    }, 2600);
  },

  setView: (v) => set({ view: v }),

  /* ---------------- pro features & easter eggs ---------------- */
  setSpotlightElement: (el) => set({ spotlightElement: el }),

  setGhostReplayActive: (v) => set({ ghostReplayActive: v }),

  triggerBootSequence: () => {
    playSfx("chime");
    set({ bootSequenceActive: true });
    timerRegistry.setTimeout(() => {
      set({ bootSequenceActive: false });
    }, BMTC_CONFIG.timings.bootDurationMs);
  },

  toggleEngineeringMode: () => {
    playSfx("disco");
    set({ engineeringMode: !get().engineeringMode });
  },

  unlockKonami: () => {
    playSfx("disco");
    set({ konamiUnlocked: true, chassisLivery: "chassis-cyber" });
  },

  /* ---------------- deck engine ---------------- */
  goToSlide: (n) => {
    const clamped = Math.max(1, Math.min(10, n));
    if (clamped !== get().currentSlide) playSfx("whoosh");
    set({ currentSlide: clamped });
  },

  nextSlide: () => get().goToSlide(get().currentSlide + 1),

  prevSlide: () => get().goToSlide(get().currentSlide - 1),

  toggleDeckMode: () => {
    playSfx("tap");
    set({ deckArticle: !get().deckArticle });
  },
}));

export { FARE_LADDER, STAGES, type FareStop };
