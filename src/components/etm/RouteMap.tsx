"use client";

/* ============================================================
   ROUTE 335-E LIVING MAP (Majestic ↔ Electronic City Corridor)
   Interactive vector corridor map with animated bus tracker,
   stop dots, landmark highlights, and bidirectional sync with ETM.
   ============================================================ */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useEtm } from "@/lib/etm-store";
import { FARE_LADDER } from "@/lib/config";
import { playSfx } from "@/lib/audio";

interface RouteStopPoint {
  id: string;
  fare: number;
  en: string;
  kn: string;
  x: number;
  y: number;
  landmark?: string;
}

const ROUTE_POINTS: RouteStopPoint[] = [
  { id: "majestic", fare: 51, en: "Majestic (KBS)", kn: "ಮೆಜೆಸ್ಟಿಕ್", x: 45, y: 38, landmark: "Central Depot" },
  { id: "mg-road", fare: 44, en: "MG Road", kn: "ಎಂ.ಜಿ. ರಸ್ತೆ", x: 95, y: 55, landmark: "Metro Purple Line" },
  { id: "halasuru", fare: 38, en: "Halasuru", kn: "ಹಲಸೂರು", x: 145, y: 75 },
  { id: "indiranagar", fare: 31, en: "Indiranagar", kn: "ಇಂದಿರಾನಗರ", x: 195, y: 105, landmark: "100ft Road" },
  { id: "koramangala", fare: 25, en: "Jayadeva / KRM", kn: "ಜಯದೇವ", x: 235, y: 145, landmark: "Flyover Hub" },
  { id: "madiwala", fare: 18, en: "Madiwala", kn: "ಮಾದಿವಾಳ", x: 275, y: 195, landmark: "Market Junction" },
  { id: "btm", fare: 12, en: "BTM Layout", kn: "ಬಿಟಿಎಸ್", x: 310, y: 240 },
  { id: "shivanahalli", fare: 6, en: "Shivanahalli", kn: "ಶಿವನೊಹಳ್ಳಿ", x: 345, y: 280 },
  { id: "ecity", fare: 60, en: "Electronic City", kn: "ಇ-ಸಿಟಿ", x: 385, y: 325, landmark: "Tech Corridor" },
];

export default function RouteMap({
  compact = false,
  onClose,
}: {
  compact?: boolean;
  onClose?: () => void;
}) {
  const currentFare = useEtm((s) => s.fare);
  const currentDest = useEtm((s) => s.destEn);
  const tapFare = useEtm((s) => s.tapFare);

  // Find active stop index
  const activeStopIndex = useMemo(() => {
    const idx = ROUTE_POINTS.findIndex(
      (p) => p.fare === currentFare || currentDest.toLowerCase().includes(p.en.toLowerCase().slice(0, 4))
    );
    return idx >= 0 ? idx : 5; // Default to Madiwala (idx 5)
  }, [currentFare, currentDest]);

  const activePoint = ROUTE_POINTS[activeStopIndex];

  // SVG spline path through all points
  const pathD = useMemo(() => {
    return ROUTE_POINTS.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth cubic curve to next point
      const prev = ROUTE_POINTS[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) * 0.5;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) * 0.5;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, "");
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#222d3d] bg-[#0c1017]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-extrabold tracking-tight">Route 335-E Corridor</h3>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-300">
                LIVE ARTERY
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8]">
              Majestic ⇄ Electronic City · 28.4 km Corridor · Hosur Road Spine
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Corridor SVG Canvas */}
      <div className="relative my-3 flex items-center justify-center overflow-x-auto py-2">
        <svg
          viewBox="20 15 390 335"
          className="w-full max-w-[480px] select-none"
          style={{ filter: "drop-shadow(0 0 12px rgba(56, 189, 248, 0.15))" }}
        >
          {/* Subtle grid lines */}
          <line x1="30" y1="50" x2="400" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="30" y1="150" x2="400" y2="150" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="30" y1="250" x2="400" y2="250" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Hosur Road Artery Glow Track */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(56, 189, 248, 0.15)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Artery Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Gradients and Filters */}
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stop Nodes */}
          {ROUTE_POINTS.map((pt, i) => {
            const isSelected = i === activeStopIndex;
            return (
              <g
                key={pt.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  playSfx("tap");
                  const matchingStop = FARE_LADDER.find(
                    (s) => s.en.toLowerCase().includes(pt.en.toLowerCase().slice(0, 4))
                  );
                  if (matchingStop) {
                    tapFare(matchingStop);
                  }
                }}
              >
                {/* Ping wave on active stop */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.8"
                  >
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node Outer Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? "#10b981" : "#1e293b"}
                  stroke={isSelected ? "#ffffff" : "#64748b"}
                  strokeWidth={isSelected ? 2 : 1.5}
                />

                {/* Stop Labels */}
                <text
                  x={pt.x + (i % 2 === 0 ? 12 : -12)}
                  y={pt.y + (i % 2 === 0 ? -4 : 10)}
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  fill={isSelected ? "#ffffff" : "#94a3b8"}
                  fontSize={isSelected ? "10.5" : "9"}
                  fontWeight={isSelected ? "bold" : "normal"}
                  className="pointer-events-none"
                >
                  {pt.en}
                </text>

                <text
                  x={pt.x + (i % 2 === 0 ? 12 : -12)}
                  y={pt.y + (i % 2 === 0 ? 7 : 21)}
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  fill={isSelected ? "#34d399" : "#64748b"}
                  fontSize="8"
                  className="pointer-events-none font-mono"
                >
                  ₹{pt.fare} · {pt.kn}
                </text>
              </g>
            );
          })}

          {/* Traveling BMTC Bus Icon */}
          <motion.g
            animate={{ x: activePoint.x, y: activePoint.y }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="pointer-events-none"
          >
            {/* Bus Glow Halo */}
            <circle cx="0" cy="0" r="14" fill="rgba(16, 185, 129, 0.25)" />

            {/* BMTC Bus Chassis Badge */}
            <rect
              x="-9"
              y="-6"
              width="18"
              height="12"
              rx="3"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Bus Windows */}
            <rect x="-7" y="-4" width="4" height="4" rx="1" fill="#f8fafc" />
            <rect x="-1" y="-4" width="4" height="4" rx="1" fill="#f8fafc" />
            <rect x="5" y="-4" width="2" height="4" rx="0.5" fill="#f8fafc" />
            {/* Headlights */}
            <circle cx="8" cy="2" r="1" fill="#fde047" />
          </motion.g>
        </svg>
      </div>

      {/* Active Stop Card & Direct Action */}
      <div className="flex items-center justify-between rounded-xl border border-[#1e293b] bg-[#151c27] p-3 text-[12px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-emerald-500/15 font-mono text-[14px] font-extrabold text-emerald-400">
            <span>₹{activePoint.fare}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{activePoint.en}</span>
              <span className="text-[#94a3b8]">({activePoint.kn})</span>
            </div>
            <div className="text-[11px] text-[#64748b]">
              {activePoint.landmark ? `★ ${activePoint.landmark}` : "Standard Corridor Stop"}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playSfx("tap");
            const match = FARE_LADDER.find(
              (s) => s.en.toLowerCase().includes(activePoint.en.toLowerCase().slice(0, 4))
            );
            if (match) tapFare(match);
          }}
          className="rounded-lg bg-emerald-500/20 px-3 py-1.5 font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
        >
          Select Stop
        </button>
      </div>
    </div>
  );
}
