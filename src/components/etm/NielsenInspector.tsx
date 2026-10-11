"use client";

/* ============================================================
   NIELSEN HEURISTIC INSPECTOR
   Interactive Nielsen 10 Usability Heuristics learning panel
   with element spotlighting, pedagogical cards, and automated tour.
   ============================================================ */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BMTC_CONFIG } from "@/lib/config";
import { playSfx } from "@/lib/audio";
import { kannadaVoice } from "@/lib/voice";

export interface HeuristicItem {
  id: string;
  number: number;
  title: string;
  titleKn: string;
  targetElement: string;
  description: string;
  badge: string;
}

export default function NielsenInspector({
  activeHeuristicId,
  onSelectHeuristic,
  onClose,
}: {
  activeHeuristicId?: string | null;
  onSelectHeuristic: (id: string | null) => void;
  onClose?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(activeHeuristicId || "H1");
  const [isTourRunning, setIsTourRunning] = useState<boolean>(false);

  const heuristics = BMTC_CONFIG.heuristics;
  const currentHeuristic =
    heuristics.find((h) => h.id === selectedId) || heuristics[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectHeuristic(id);
    playSfx("tap");
  };

  // Tour mode timer
  useEffect(() => {
    if (!isTourRunning) return;
    const interval = setInterval(() => {
      setSelectedId((prev) => {
        const idx = heuristics.findIndex((h) => h.id === prev);
        const nextIdx = (idx + 1) % heuristics.length;
        const nextH = heuristics[nextIdx];
        onSelectHeuristic(nextH.id);
        playSfx("whoosh");
        return nextH.id;
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [isTourRunning, heuristics, onSelectHeuristic]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#222d3d] bg-[#0c1017]/95 text-white shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <span className="font-mono text-[13px] font-black">10</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-extrabold tracking-tight">Nielsen Usability Inspector</h3>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-300">
                CASE STUDY TEACHER
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8]">
              Interactive mapping of 10 heuristics to the BMTC Smart-ETM hardware
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Automated Tour Toggle */}
          <button
            onClick={() => {
              playSfx(isTourRunning ? "tap" : "chime");
              setIsTourRunning(!isTourRunning);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              isTourRunning
                ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                : "border border-[#222d3d] bg-[#151c27] text-sky-400 hover:border-sky-500"
            }`}
          >
            {isTourRunning ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-black" />
                Stop Tour
              </>
            ) : (
              <>
                <span>▶</span> Start 10-Step Tour
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Heuristic Details Spotlight Card */}
      <div className="border-b border-[#1e293b] bg-[#101622] p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeuristic.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-400">
                {currentHeuristic.id}: {currentHeuristic.badge}
              </span>
              <span className="font-mono text-[10.5px] text-[#64748b]">
                Heuristic {currentHeuristic.number} of 10
              </span>
            </div>

            <div className="mt-1">
              <h4 className="text-[16px] font-extrabold text-white">
                {currentHeuristic.title}
              </h4>
              <p
                className="text-[12px] font-medium text-emerald-400"
                style={{ fontFamily: "var(--font-kannada), sans-serif" }}
              >
                {currentHeuristic.titleKn}
              </p>
            </div>

            <p className="mt-1 text-[13px] leading-relaxed text-[#cbd5e1]">
              {currentHeuristic.description}
            </p>

            <div className="mt-2 flex items-center justify-between rounded-lg border border-[#222d3d] bg-[#0c1017] p-2 text-[11.5px]">
              <span className="font-mono text-[#94a3b8]">
                Spotlight Target: <strong className="text-sky-300">.{currentHeuristic.targetElement}</strong>
              </span>
              <button
                onClick={() => {
                  playSfx("chime");
                  onSelectHeuristic(currentHeuristic.id);
                }}
                className="font-bold text-emerald-400 hover:underline"
              >
                Pulse Element in Simulator ⌖
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Heuristics 1-10 Grid / Selector List */}
      <div className="nice-scroll flex-1 overflow-y-auto p-3">
        <div className="grid gap-2">
          {heuristics.map((h) => {
            const isSelected = h.id === selectedId;
            return (
              <button
                key={h.id}
                onClick={() => handleSelect(h.id)}
                className={`flex items-start gap-3 rounded-xl border p-2.5 text-left transition ${
                  isSelected
                    ? "border-sky-500/60 bg-sky-500/15 shadow-[0_2px_12px_rgba(56,189,248,0.2)]"
                    : "border-[#1e293b] bg-[#121824] hover:border-[#334155] hover:bg-[#161f30]"
                }`}
              >
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                    isSelected ? "bg-sky-500 text-white" : "bg-[#1e293b] text-[#94a3b8]"
                  }`}
                >
                  {h.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[12.5px] font-bold ${isSelected ? "text-white" : "text-[#cbd5e1]"}`}>
                      {h.title}
                    </span>
                    <span className="text-[10px] text-[#64748b]">{h.id}</span>
                  </div>
                  <div className="truncate text-[11px] text-[#94a3b8]">{h.badge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
