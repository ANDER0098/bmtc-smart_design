"use client";

/* ============================================================
   THEME & LIVERY SWITCHER
   Supports 4 custom palettes + 3 hardware chassis skins
   with View Transitions API circular-reveal animation.
   ============================================================ */

import React, { useEffect, useState } from "react";
import { playSfx } from "@/lib/audio";
import { BMTC_CONFIG } from "@/lib/config";

export type ThemeId = "midnight" | "heritage" | "phosphor" | "daylight";
export type ChassisLivery = "chassis-matte" | "chassis-heritage" | "chassis-cyber";

export default function ThemeSwitcher({
  currentLivery,
  onLiveryChange,
}: {
  currentLivery: ChassisLivery;
  onLiveryChange: (livery: ChassisLivery) => void;
}) {
  const [theme, setTheme] = useState<ThemeId>("midnight");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bmtc_theme") as ThemeId;
      if (saved) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const switchTheme = (newTheme: ThemeId) => {
    playSfx("tap");
    setTheme(newTheme);

    const apply = () => {
      document.documentElement.setAttribute("data-theme", newTheme);
      try {
        localStorage.setItem("bmtc_theme", newTheme);
      } catch {
        // ignore
      }
    };

    // If View Transitions API is available, wrap transition
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#222d3d] bg-[#121824] p-3 text-white">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#94a3b8]">
          Theme &amp; Livery
        </span>
        <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-400">
          2026 PALETTES
        </span>
      </div>

      {/* 4 Themes */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {BMTC_CONFIG.themes.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTheme(t.id as ThemeId)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition ${
              theme === t.id
                ? "border-sky-400 bg-sky-400/15 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                : "border-[#1e293b] bg-[#151c27] text-[#94a3b8] hover:border-[#334155] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.canvas }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
            </div>
            <span className="text-[10px] font-bold">{t.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* 3 Chassis Skins */}
      <div className="mt-1 flex items-center justify-between border-t border-[#1e293b] pt-2 text-[11px]">
        <span className="text-[#94a3b8]">Hardware Chassis:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              playSfx("tap");
              onLiveryChange("chassis-matte");
            }}
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              currentLivery === "chassis-matte"
                ? "bg-slate-700 text-white border border-slate-500"
                : "text-[#64748b] hover:text-white"
            }`}
          >
            Matte Black
          </button>
          <button
            onClick={() => {
              playSfx("tap");
              onLiveryChange("chassis-heritage");
            }}
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              currentLivery === "chassis-heritage"
                ? "bg-red-600 text-white border border-red-400"
                : "text-[#64748b] hover:text-white"
            }`}
          >
            BMTC Red
          </button>
          <button
            onClick={() => {
              playSfx("tap");
              onLiveryChange("chassis-cyber");
            }}
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              currentLivery === "chassis-cyber"
                ? "bg-purple-600 text-white border border-purple-400"
                : "text-[#64748b] hover:text-white"
            }`}
          >
            Cyber Unit
          </button>
        </div>
      </div>
    </div>
  );
}
