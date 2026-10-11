"use client";

/* ============================================================
   PRESENTATION HELPERS — reveal.js-style tooling
   Slide Overview ("O"), Speaker Notes ("S"), Shortcuts ("?")
   ============================================================ */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEtm } from "@/lib/etm-store";
import { playSfx } from "@/lib/audio";

const SLIDE_DATA = [
  {
    num: 1,
    title: "Executive Summary & The Winning Thesis",
    notes:
      "Hook the audience immediately: State the 3.3s thesis vs 12s legacy baseline. Emphasize that conductors issue 800+ tickets a shift on moving buses. Dwell time reduction directly improves fleet frequency.",
  },
  {
    num: 2,
    title: "Field Grounding & Hardware Failures",
    notes:
      "Explain real Karnataka field conditions: Thermal paper jams in humidity, broken touchscreens, conductor eye-strain. We didn't design in a vacuum — we designed for grease, glare, and Bangalore potholes.",
  },
  {
    num: 3,
    title: "First-Principles Reframe (Destination vs Fare)",
    notes:
      "Key pivot: Conductors think in FARES, not alphabetical destination lists. 92% of tickets fall into only 6 fare buckets. Organizing by fare eliminates menu digging.",
  },
  {
    num: 4,
    title: "Environmental Constraints & Assumptions",
    notes:
      "Demo the road roughness & glare sliders here. Emphasize AAA contrast ratio (14.2:1) under direct sunlight and high thumb target sizes (>48px minimum).",
  },
  {
    num: 5,
    title: "The 3-Tap, 3.3-Second Architecture",
    notes:
      "Walk the 3 taps: Tap 1 Fare, Tap 2 Pax, Tap 3 Issue. Show that every single action has immediate sensory confirmation (audio chime + thermal spool).",
  },
  {
    num: 6,
    title: "High-Fidelity UI Specs & Screen Annotations",
    notes:
      "Deep-dive on the micro-interactions: The 8-second undo ring, the status strip sync count, bilingual Kannada typography (Noto Sans Kannada).",
  },
  {
    num: 7,
    title: "Thumb Reachability Strategy & Fitts's Law",
    notes:
      "Fitts's Law math: Target distance D and width W. Bottom thumb sweet-spot puts primary actions in effortless reach. Left-hand mode provides southpaw equality.",
  },
  {
    num: 8,
    title: "Edge Cases & Product Resilience Matrix",
    notes:
      "Explain the 7 edge cases: E1 Offline underground queue, E2 Paper-out lockout, E3 GPS loss, E4 Hold-to-void ring, E7 Night AAA mode.",
  },
  {
    num: 9,
    title: "Timed Walkthrough Proof & 30s Video Script",
    notes:
      "Play the Ghost-Hand Replay scrubber to prove the 3.24s stopwatch claim live on stage. Point to the live progression chart.",
  },
  {
    num: 10,
    title: "Field Validation Plan & Interview Defense Guide",
    notes:
      "Wrap up with pilot depot rollout metrics: Target 50 conductors on Route 335-E, A/B dwell measurement at Silk Board junction, Nielsen heuristic compliance checklist.",
  },
];

/* ------------------------------------------------------------
   1. SLIDE OVERVIEW GRID ("O" key)
------------------------------------------------------------ */
export function SlideOverviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const currentSlide = useEtm((s) => s.currentSlide);
  const goToSlide = useEtm((s) => s.goToSlide);
  const setView = useEtm((s) => s.setView);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 p-6 backdrop-blur-lg"
      onClick={onClose}
    >
      <div
        className="nice-scroll max-h-[90vh] w-full max-w-[1100px] overflow-y-auto rounded-3xl border border-[#222d3d] bg-[#0c1017] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 font-bold">
              ☷
            </span>
            <div>
              <h3 className="text-[17px] font-extrabold text-white">Slide Overview Grid</h3>
              <p className="text-[12px] text-[#94a3b8]">Click any slide card to jump instantly (Press &apos;O&apos;)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {SLIDE_DATA.map((s) => {
            const isCurrent = s.num === currentSlide;
            return (
              <button
                key={s.num}
                onClick={() => {
                  playSfx("tap");
                  setView("split");
                  goToSlide(s.num);
                  onClose();
                }}
                className={`group flex flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                  isCurrent
                    ? "border-sky-400 bg-sky-500/15 shadow-[0_0_20px_rgba(56,189,248,0.3)] ring-2 ring-sky-400"
                    : "border-[#1e293b] bg-[#121824] hover:border-sky-500/50 hover:bg-[#182234]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[11px] font-extrabold ${
                        isCurrent ? "text-sky-300" : "text-[#64748b] group-hover:text-white"
                      }`}
                    >
                      SLIDE {s.num}
                    </span>
                    {isCurrent && (
                      <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </div>
                  <h4 className="mt-2 text-[12.5px] font-extrabold text-white line-clamp-3">
                    {s.title}
                  </h4>
                </div>
                <div className="mt-4 text-[10px] text-[#94a3b8] group-hover:text-sky-300">
                  Jump to slide →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   2. SPEAKER NOTES PANEL ("S" key)
------------------------------------------------------------ */
export function SpeakerNotesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const currentSlide = useEtm((s) => s.currentSlide);
  const nextSlide = useEtm((s) => s.nextSlide);
  const prevSlide = useEtm((s) => s.prevSlide);
  const [seconds, setSeconds] = useState<number>(0);

  // Presentation Pacing Timer
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  const currentData = SLIDE_DATA[currentSlide - 1] || SLIDE_DATA[0];
  const nextData = SLIDE_DATA[currentSlide] || null;

  const fmtMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9998] flex justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[900px] rounded-2xl border border-sky-500/40 bg-[#0c1017]/98 p-5 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-[12px]">
              🎙
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-sky-400">
                  SLIDE {currentSlide} OF 10
                </span>
                <span className="text-[14px] font-extrabold text-white">
                  Speaker Notes &amp; Video Script
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pacing Timer */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#222d3d] bg-[#151c27] px-2.5 py-1 font-mono text-[11px]">
              <span className="text-[#94a3b8]">Time:</span>
              <span className={seconds > 240 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                {fmtMinSec(seconds)} / 05:00
              </span>
            </div>

            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="my-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Main Talking Points */}
          <div className="col-span-2 rounded-xl border border-[#1e293b] bg-[#121824] p-3.5">
            <h4 className="text-[13px] font-bold text-sky-300">
              {currentData.title}
            </h4>
            <p className="mt-2 text-[13px] leading-relaxed text-[#cbd5e1]">
              {currentData.notes}
            </p>
          </div>

          {/* Next Slide Preview */}
          <div className="flex flex-col justify-between rounded-xl border border-[#1e293b] bg-[#121824] p-3.5 text-[11.5px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748b]">Up Next</span>
              <div className="mt-1 font-bold text-white line-clamp-2">
                {nextData ? `Slide ${nextData.num}: ${nextData.title}` : "End of Presentation (Q&A)"}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  playSfx("whoosh");
                  prevSlide();
                }}
                disabled={currentSlide <= 1}
                className="flex-1 rounded-lg border border-[#222d3d] bg-[#151c27] py-1 font-bold text-[#94a3b8] hover:text-white disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => {
                  playSfx("whoosh");
                  nextSlide();
                }}
                disabled={currentSlide >= 10}
                className="flex-1 rounded-lg bg-sky-500 py-1 font-bold text-black hover:bg-sky-400 disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   3. KEYBOARD SHORTCUTS MODAL ("?" key)
------------------------------------------------------------ */
export function KeyboardCheatSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const shortcuts = [
    { key: "← / →", desc: "Navigate slides forward and backward" },
    { key: "O", desc: "Toggle reveal.js-style Slide Overview Grid" },
    { key: "S", desc: "Toggle Speaker Notes & Pacing Timer" },
    { key: "⌘K / Ctrl+K", desc: "Open universal Command Palette" },
    { key: "?", desc: "Open this keyboard shortcut reference" },
    { key: "1 - 6", desc: "Set passenger quantity on Count & Pay screen" },
    { key: "Enter / Space", desc: "Issue ticket / Print" },
    { key: "Esc", desc: "Close open bottom sheets, modals, and drawers" },
    { key: "N", desc: "Toggle Night Mode (AAA contrast polarity)" },
    { key: "Type '335E'", desc: "Honk BMTC dual-tone bus air horn easter egg" },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-3xl border border-[#222d3d] bg-[#0c1017] p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
              ⌨
            </span>
            <h3 className="text-[15px] font-extrabold text-white">Keyboard Shortcuts Cheat Sheet</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 divide-y divide-[#1e293b]">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-[12.5px]">
              <span className="text-[#cbd5e1]">{s.desc}</span>
              <kbd className="rounded-md border border-[#222d3d] bg-[#151c27] px-2 py-0.5 font-mono text-[11px] font-bold text-sky-400">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
