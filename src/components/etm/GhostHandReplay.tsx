"use client";

/* ============================================================
   GHOST-HAND REPLAY & SCRUBBER
   Video-editor style scrubbable timeline with translucent ghost
   thumb re-performing benchmark interactions to prove Slide 9.
   ============================================================ */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEtm } from "@/lib/etm-store";
import { playSfx } from "@/lib/audio";

export interface ReplayKeyframe {
  timeMs: number;
  x: number; // percentage of screen width (0-100)
  y: number; // percentage of screen height (0-100)
  action: string;
  label: string;
  target: "fare" | "pax" | "issue" | "print";
}

const DEFAULT_BENCHMARK_FRAMES: ReplayKeyframe[] = [
  { timeMs: 0, x: 50, y: 85, action: "Rest Position", label: "Thumb in ergonomic ready zone", target: "fare" },
  { timeMs: 420, x: 62, y: 44, action: "Tap Madiwala ₹18", label: "Tap 1: Fare Selected (₹18)", target: "fare" },
  { timeMs: 780, x: 50, y: 55, action: "Screen Transition", label: "Instant Count & Pay Screen", target: "fare" },
  { timeMs: 1420, x: 65, y: 38, action: "Tap Pax 3", label: "Tap 2: 3 Passengers (₹54)", target: "pax" },
  { timeMs: 2240, x: 50, y: 88, action: "Tap Issue Ticket", label: "Tap 3: Primary Issue CTA", target: "issue" },
  { timeMs: 2750, x: 50, y: 15, action: "Thermal Print Feed", label: "1250ms High-Speed Print", target: "print" },
  { timeMs: 3240, x: 50, y: 50, action: "Benchmark Complete", label: "✓ 3.24s Validated Pass", target: "print" },
];

export default function GhostHandReplay({
  active,
  onClose,
}: {
  active: boolean;
  onClose?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const totalDurationMs = 3300;

  const tapFare = useEtm((s) => s.tapFare);
  const setPax = useEtm((s) => s.setPax);
  const issue = useEtm((s) => s.issue);
  const goHome = useEtm((s) => s.goHome);

  const lastExecutedStepRef = useRef<number>(-1);
  const rafRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);

  // Interpolate ghost thumb position based on currentTimeMs
  const currentPos = (() => {
    const frames = DEFAULT_BENCHMARK_FRAMES;
    if (currentTimeMs <= frames[0].timeMs) return { x: frames[0].x, y: frames[0].y, label: frames[0].label };
    if (currentTimeMs >= frames[frames.length - 1].timeMs) {
      const last = frames[frames.length - 1];
      return { x: last.x, y: last.y, label: last.label };
    }

    // Find bounding keyframes
    let prev = frames[0];
    let next = frames[1];
    for (let i = 0; i < frames.length - 1; i++) {
      if (currentTimeMs >= frames[i].timeMs && currentTimeMs <= frames[i + 1].timeMs) {
        prev = frames[i];
        next = frames[i + 1];
        break;
      }
    }

    const t = (currentTimeMs - prev.timeMs) / (next.timeMs - prev.timeMs);
    // Smooth easeInOut interpolation
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    return {
      x: prev.x + (next.x - prev.x) * ease,
      y: prev.y + (next.y - prev.y) * ease,
      label: next.label,
    };
  })();

  // Synchronize actual simulator actions to timeline triggers
  useEffect(() => {
    if (!active) return;

    if (currentTimeMs >= 420 && lastExecutedStepRef.current < 1) {
      lastExecutedStepRef.current = 1;
      tapFare({ fare: 18, kn: "ಮಾದಿವಾಳ", en: "Madiwala" });
    }
    if (currentTimeMs >= 1420 && lastExecutedStepRef.current < 2) {
      lastExecutedStepRef.current = 2;
      setPax(3);
    }
    if (currentTimeMs >= 2240 && lastExecutedStepRef.current < 3) {
      lastExecutedStepRef.current = 3;
      issue();
    }
    if (currentTimeMs < 300 && lastExecutedStepRef.current > 0) {
      lastExecutedStepRef.current = 0;
      goHome();
    }
  }, [currentTimeMs, active, tapFare, setPax, issue, goHome]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    lastTickTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTickTimeRef.current) * playbackSpeed;
      lastTickTimeRef.current = now;

      setCurrentTimeMs((prev) => {
        const next = prev + delta;
        if (next >= totalDurationMs) {
          setIsPlaying(false);
          return totalDurationMs;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed, totalDurationMs]);

  if (!active) return null;

  return (
    <>
      {/* Ghost Thumb Cursor Overlay on the ETM Screen */}
      <div
        className="pointer-events-none absolute inset-0 z-[600] overflow-hidden rounded-[26px]"
        aria-hidden="true"
      >
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${currentPos.x}%`,
            top: `${currentPos.y}%`,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        >
          {/* Biometric Touch Ripple Ring */}
          <div className="absolute -inset-4 animate-ping rounded-full border-2 border-sky-400/50" />

          {/* Translucent Ghost Thumb Circle */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-400/30 shadow-[0_0_24px_rgba(56,189,248,0.7)] backdrop-blur-sm">
            {/* Inner thumb ridge touch pad */}
            <div className="h-6 w-6 rounded-full border border-sky-200/60 bg-sky-300/40 shadow-inner" />
          </div>

          {/* Action Caption Label */}
          <div className="absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-md border border-sky-500/40 bg-black/90 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300 shadow-xl backdrop-blur-md">
            {currentPos.label}
          </div>
        </motion.div>
      </div>

      {/* Scrubber Bar Dock at Bottom of Simulator */}
      <div className="mt-3 w-full max-w-[400px] rounded-2xl border border-[#222d3d] bg-[#0c1017]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-sky-400" />
            <span className="font-extrabold text-white">Ghost-Hand Replay Scrubber</span>
            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-300">
              PROVE SLIDE 9
            </span>
          </div>

          <div className="font-mono text-[11px] font-bold text-sky-400">
            {(currentTimeMs / 1000).toFixed(2)}s / 3.30s
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="mt-2.5">
          <input
            type="range"
            min={0}
            max={totalDurationMs}
            value={currentTimeMs}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentTimeMs(Number(e.target.value));
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1e293b] accent-sky-400"
          />
        </div>

        {/* Playback Controls Row */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            <button
              onClick={() => {
                playSfx("tap");
                if (currentTimeMs >= totalDurationMs) setCurrentTimeMs(0);
                setIsPlaying(!isPlaying);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-black font-bold transition hover:bg-sky-400"
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                playSfx("tap");
                setIsPlaying(false);
                setCurrentTimeMs(0);
                lastExecutedStepRef.current = -1;
                goHome();
              }}
              className="flex h-7 px-2 items-center justify-center rounded-lg border border-[#222d3d] bg-[#151c27] text-[11px] font-bold text-[#94a3b8] hover:text-white"
            >
              ↺ Reset
            </button>
          </div>

          {/* Speed Selectors */}
          <div className="flex items-center gap-1">
            {[0.5, 1, 2].map((sp) => (
              <button
                key={sp}
                onClick={() => setPlaybackSpeed(sp)}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition ${
                  playbackSpeed === sp
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-[#64748b] hover:text-white"
                }`}
              >
                {sp}×
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-[11px] font-bold text-[#64748b] hover:text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </>
  );
}
