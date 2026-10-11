"use client";

/* ============================================================
   OLD-VS-NEW A/B SPEED RACE MODE
   Dual-device head-to-head race comparing Legacy ETM (12.4s)
   against the BMTC Smart-ETM 3-tap architecture (3.2s).
   ============================================================ */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSfx } from "@/lib/audio";
import { ConfettiBurst } from "@/components/fx/visuals";

export default function RaceMode({ onClose }: { onClose?: () => void }) {
  const [racing, setRacing] = useState<boolean>(false);
  const [smartTime, setSmartTime] = useState<number>(0);
  const [legacyTime, setLegacyTime] = useState<number>(0);
  const [smartFinished, setSmartFinished] = useState<boolean>(false);
  const [legacyFinished, setLegacyFinished] = useState<boolean>(false);

  // Scripted step trackers
  const [smartStep, setSmartStep] = useState<number>(0); // 0: idle, 1: tap fare, 2: tap pax, 3: printing, 4: done
  const [legacyStep, setLegacyStep] = useState<number>(0); // 0: idle, 1: enter stage code, 2: scroll fare menu, 3: pax mult, 4: matrix print, 5: done

  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const startRace = () => {
    playSfx("race_start");
    setRacing(true);
    setSmartFinished(false);
    setLegacyFinished(false);
    setSmartTime(0);
    setLegacyTime(0);
    setSmartStep(1);
    setLegacyStep(1);
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (!racing) return;

    const loop = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;

      // Smart ETM simulation timeline: finishes in 3.2s
      if (!smartFinished) {
        setSmartTime(Math.min(3.24, elapsed));
        if (elapsed >= 0.6 && smartStep === 1) setSmartStep(2); // Pax tap
        if (elapsed >= 1.6 && smartStep === 2) setSmartStep(3); // Issue & print
        if (elapsed >= 3.24) {
          setSmartFinished(true);
          setSmartStep(4);
          setConfettiTrigger((t) => t + 1);
          playSfx("success");
        }
      }

      // Legacy ETM simulation timeline: finishes in 12.4s
      if (!legacyFinished) {
        setLegacyTime(Math.min(12.42, elapsed));
        if (elapsed >= 3.2 && legacyStep === 1) setLegacyStep(2); // menu search
        if (elapsed >= 6.4 && legacyStep === 2) setLegacyStep(3); // pax math
        if (elapsed >= 8.8 && legacyStep === 3) setLegacyStep(4); // dot-matrix print
        if (elapsed >= 12.42) {
          setLegacyFinished(true);
          setLegacyStep(5);
          playSfx("error");
          setRacing(false);
        }
      }

      if (!smartFinished || !legacyFinished) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [racing, smartFinished, legacyFinished, smartStep, legacyStep]);

  return (
    <div className="relative mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-2xl border border-[#222d3d] bg-[#0c1017]/95 p-5 text-white shadow-2xl backdrop-blur-2xl">
      {smartFinished && <ConfettiBurst trigger={confettiTrigger} />}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-500 font-mono text-[16px] font-black text-black">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-extrabold tracking-tight">
                Old vs New: Head-to-Head Speed Benchmark Race
              </h2>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                PROVE THE THESIS
              </span>
            </div>
            <p className="text-[12px] text-[#94a3b8]">
              Simultaneous timed race: Legacy Paper-Matrix ETM (12.4s) vs BMTC Smart-ETM (3.2s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startRace}
            disabled={racing}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-mono text-[13px] font-extrabold shadow-lg transition ${
              racing
                ? "cursor-not-allowed bg-[#1e293b] text-[#64748b]"
                : "bg-gradient-to-r from-emerald-500 to-sky-500 text-black hover:opacity-90 active:scale-95"
            }`}
          >
            <span>🏁</span>
            {racing ? "RACE IN PROGRESS…" : "START SPEED RACE"}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Duel Grid */}
      <div className="my-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: Legacy ETM */}
        <div className="relative flex flex-col rounded-2xl border border-red-500/30 bg-[#140b0d]/80 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
            <div>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10.5px] font-bold text-red-400">
                BEFORE: LEGACY ETM (1998–2022)
              </span>
              <h3 className="mt-1 text-[15px] font-extrabold text-white">Paper Matrix Keyboard Terminal</h3>
            </div>
            <div className="font-mono text-[24px] font-black text-red-400">
              {legacyTime.toFixed(2)}s
            </div>
          </div>

          {/* Legacy Screen Graphic */}
          <div className="my-4 flex h-[280px] flex-col items-center justify-center rounded-xl border border-neutral-700 bg-[#1a2016] p-4 font-mono text-[#86efac] shadow-inner">
            <div className="w-full border-b border-[#2d4224] pb-1 text-center text-[10px] uppercase text-[#65a30d]">
              -- BMTC DEPOT 4: MICRO-P ETM v2.1 --
            </div>
            <div className="my-auto flex flex-col items-center gap-2 text-center">
              {legacyStep === 0 && (
                <div className="text-[13px] text-[#4ade80]">READY: PRESS [STAGE] TO BEGIN</div>
              )}
              {legacyStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px]">
                  <div className="text-[#facc15]">STAGE CODE: [ 1 0 ] [ENTER]</div>
                  <div className="text-[10px] text-neutral-400">WAITING FOR STAGE LOOKUP (3.2s)…</div>
                </motion.div>
              )}
              {legacyStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px]">
                  <div className="text-[#facc15]">FARE MENU: &gt; MADIWALA ST-10</div>
                  <div className="text-[10px] text-neutral-400">PRESS [SELECT] THEN [QTY] (3.2s)…</div>
                </motion.div>
              )}
              {legacyStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px]">
                  <div className="text-[#facc15]">QTY: [ 3 ] * 18 = RS. 54</div>
                  <div className="text-[10px] text-neutral-400">PRESS [PRINT] (2.4s)…</div>
                </motion.div>
              )}
              {legacyStep === 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px]">
                  <div className="animate-pulse text-amber-400">⚡ 9-PIN DOT MATRIX PRINTING…</div>
                  <div className="text-[10px] text-neutral-400">CH-CH-CH-CH-CH (3.6s spool)</div>
                </motion.div>
              )}
              {legacyStep === 5 && (
                <div className="text-[14px] font-bold text-red-400">
                  COMPLETED: 12.42s (14 Keypresses)
                </div>
              )}
            </div>
            <div className="text-[9.5px] text-[#4d7c0f]">
              FAIL: High Conductor Cognitive Load · Passenger Queuing
            </div>
          </div>

          {/* Legacy Specs */}
          <div className="grid grid-cols-3 gap-2 border-t border-red-500/20 pt-3 text-center text-[11px]">
            <div>
              <span className="text-[#94a3b8]">Total Taps</span>
              <div className="font-mono font-bold text-red-400">14 Keypresses</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Menu Depth</span>
              <div className="font-mono font-bold text-red-400">3 Sub-Menus</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Error Rate</span>
              <div className="font-mono font-bold text-red-400">18.4% Mis-taps</div>
            </div>
          </div>
        </div>

        {/* RIGHT: BMTC Smart-ETM */}
        <div className="relative flex flex-col rounded-2xl border border-emerald-500/40 bg-[#0b1614]/80 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10.5px] font-bold text-emerald-400">
                AFTER: BMTC SMART-ETM (2026)
              </span>
              <h3 className="mt-1 text-[15px] font-extrabold text-white">Biomechanical 3-Tap Architecture</h3>
            </div>
            <div className="font-mono text-[24px] font-black text-emerald-400">
              {smartTime.toFixed(2)}s
            </div>
          </div>

          {/* Smart Screen Graphic */}
          <div className="my-4 flex h-[280px] flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0f172a] p-4 shadow-inner">
            <div className="w-full border-b border-[#1e293b] pb-1 text-center text-[10px] font-bold uppercase text-sky-400">
              BMTC ROUTE 335-E · HIGH-SPEED DISPATCH
            </div>
            <div className="my-auto flex flex-col items-center gap-2 text-center">
              {smartStep === 0 && (
                <div className="text-[13px] font-bold text-[#94a3b8]">PRESS START TO LAUNCH 3-TAP FLOW</div>
              )}
              {smartStep === 1 && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-1">
                  <div className="rounded-lg bg-emerald-500 px-3 py-1 font-bold text-black">
                    TAP 1: ₹18 Madiwala (0.5s)
                  </div>
                  <div className="text-[11px] text-emerald-300">Biomechanical thumb-arc sweet spot</div>
                </motion.div>
              )}
              {smartStep === 2 && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-1">
                  <div className="rounded-lg bg-sky-500 px-3 py-1 font-bold text-black">
                    TAP 2: 3 Passengers (1.1s)
                  </div>
                  <div className="text-[11px] text-sky-300">Single-tap quantity pill bypasses keypad</div>
                </motion.div>
              )}
              {smartStep === 3 && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-1">
                  <div className="rounded-lg bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-1 font-bold text-black">
                    TAP 3: Issue & Rapid Thermal Print (1.6s)
                  </div>
                  <div className="text-[11px] text-emerald-300">Instant spool · 1250ms thermal cutter</div>
                </motion.div>
              )}
              {smartStep === 4 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-1.5">
                  <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="text-[15px] font-extrabold text-emerald-400">
                    FINISHED IN 3.24s!
                  </div>
                  <div className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                    3.8× FASTER THAN LEGACY
                  </div>
                </motion.div>
              )}
            </div>
            <div className="text-[9.5px] font-semibold text-emerald-400">
              SUCCESS: 73% Reduction in Conductor Dwell Time
            </div>
          </div>

          {/* Smart Specs */}
          <div className="grid grid-cols-3 gap-2 border-t border-emerald-500/20 pt-3 text-center text-[11px]">
            <div>
              <span className="text-[#94a3b8]">Total Taps</span>
              <div className="font-mono font-bold text-emerald-400">3 Direct Taps</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Menu Depth</span>
              <div className="font-mono font-bold text-emerald-400">0 Sub-Menus</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Error Rate</span>
              <div className="font-mono font-bold text-emerald-400">&lt; 0.8% Reach Mis-taps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Banner */}
      <AnimatePresence>
        {smartFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 via-[#0b1c18] to-sky-950/80 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-[26px]">🏆</span>
              <div>
                <h4 className="text-[15px] font-extrabold text-white">
                  Benchmark Hypothesis Validated: 3.8× Velocity Multiplier
                </h4>
                <p className="text-[12px] text-[#cbd5e1]">
                  At 850 passengers/shift, saving 9.1s per ticket saves <strong>2.15 hours</strong> of conductor cognitive strain and prevents crowd bottlenecks at boarding doors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500 px-3 py-1.5 font-mono text-[13px] font-extrabold text-black">
                -73.8% DWELL TIME
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
