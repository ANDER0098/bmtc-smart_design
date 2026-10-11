"use client";

/* ============================================================
   ⌘K COMMAND PALETTE — Powered by cmdk
   Instant keyboard navigation for slides, themes, simulations,
   voice announcements, race mode, and inspector tooling.
   ============================================================ */

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useEtm } from "@/lib/etm-store";
import { playSfx, toggleAudioMuted, isAudioMuted } from "@/lib/audio";
import { kannadaVoice } from "@/lib/voice";
import { BMTC_CONFIG } from "@/lib/config";

export default function CommandPalette({
  open,
  setOpen,
  onOpenRace,
  onOpenLedger,
  onOpenInspector,
  onOpenMap,
  onOpenBenchChart,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenRace?: () => void;
  onOpenLedger?: () => void;
  onOpenInspector?: () => void;
  onOpenMap?: () => void;
  onOpenBenchChart?: () => void;
}) {
  const store = useEtm();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "K") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  if (!open) return null;

  const runAndClose = (fn: () => void) => {
    playSfx("tap");
    fn();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-md">
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-[#222d3d] bg-[#0c1017] text-white shadow-[0_20px_70px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="flex flex-col"
          loop
        >
          {/* Input */}
          <div className="flex items-center border-b border-[#1e293b] px-4 py-3">
            <svg
              className="mr-3 h-4 w-4 text-[#94a3b8]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Command.Input
              autoFocus
              placeholder="Type a command or jump to slide (e.g. 'race', 'slide 5', 'night', 'kannada')…"
              className="w-full bg-transparent text-[14px] text-white placeholder-[#64748b] outline-none"
            />
            <kbd className="rounded border border-[#222d3d] bg-[#151c27] px-2 py-0.5 text-[10px] text-[#94a3b8]">
              ESC
            </kbd>
          </div>

          {/* List */}
          <Command.List className="nice-scroll max-h-[380px] overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-[13px] text-[#64748b]">
              No matching commands found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Pro Tooling &amp; Features" className="px-2 py-1 text-[11px] font-bold text-[#64748b]">
              <Command.Item
                onSelect={() => runAndClose(() => store.runAutoDemo())}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-emerald-400 hover:bg-[#1a2333]"
              >
                <span>⚡ Run Auto-Play 3.3s Ticketing Demo</span>
                <kbd className="text-[10px] text-[#94a3b8]">Demo</kbd>
              </Command.Item>

              {onOpenRace && (
                <Command.Item
                  onSelect={() => runAndClose(onOpenRace)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-sky-400 hover:bg-[#1a2333]"
                >
                  <span>🏁 Start Old vs New A/B Speed Race</span>
                  <kbd className="text-[10px] text-[#94a3b8]">Race</kbd>
                </Command.Item>
              )}

              {onOpenInspector && (
                <Command.Item
                  onSelect={() => runAndClose(onOpenInspector)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-amber-400 hover:bg-[#1a2333]"
                >
                  <span>🔍 Open Nielsen Heuristic Inspector (10 Usability Laws)</span>
                  <kbd className="text-[10px] text-[#94a3b8]">Nielsen</kbd>
                </Command.Item>
              )}

              {onOpenMap && (
                <Command.Item
                  onSelect={() => runAndClose(onOpenMap)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-emerald-300 hover:bg-[#1a2333]"
                >
                  <span>🗺 Open Route 335-E Living Corridor Map</span>
                  <kbd className="text-[10px] text-[#94a3b8]">Map</kbd>
                </Command.Item>
              )}

              {onOpenLedger && (
                <Command.Item
                  onSelect={() => runAndClose(onOpenLedger)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-purple-300 hover:bg-[#1a2333]"
                >
                  <span>📊 Open Conductor&apos;s Shift Ledger &amp; Settlement</span>
                  <kbd className="text-[10px] text-[#94a3b8]">Shift</kbd>
                </Command.Item>
              )}

              {onOpenBenchChart && (
                <Command.Item
                  onSelect={() => runAndClose(onOpenBenchChart)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-blue-300 hover:bg-[#1a2333]"
                >
                  <span>📈 Open Live Speed Progression Chart</span>
                  <kbd className="text-[10px] text-[#94a3b8]">Stats</kbd>
                </Command.Item>
              )}
            </Command.Group>

            {/* Environmental Stress Controls */}
            <Command.Group heading="Environment &amp; Edge Cases" className="mt-2 px-2 py-1 text-[11px] font-bold text-[#64748b]">
              <Command.Item
                onSelect={() => runAndClose(() => store.toggleEnv("isNight"))}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>🌙 Toggle Night Mode (AAA Contrast Polarity)</span>
                <span className="text-[11px] text-[#64748b]">{store.isNight ? "Active" : "Off"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runAndClose(() => store.toggleEnv("sway"))}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>🚌 Toggle Dynamic Bus Sway &amp; Road Vibration</span>
                <span className="text-[11px] text-[#64748b]">{store.sway ? "Active" : "Off"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runAndClose(() => store.toggleEnv("glare"))}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>☀️ Toggle Afternoon Sunlight Glare Filter</span>
                <span className="text-[11px] text-[#64748b]">{store.glare ? "Active" : "Off"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runAndClose(() => store.toggleEnv("lefty"))}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>🤚 Flip Handedness (Left-Hand Ergonomic Mode)</span>
                <span className="text-[11px] text-[#64748b]">{store.lefty ? "Left" : "Right"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runAndClose(() => store.toggleEnv("isOffline"))}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>📶 Edge Case E1: Toggle Tunnel Offline Queue</span>
                <span className="text-[11px] text-[#64748b]">{store.isOffline ? "Offline" : "Online"}</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runAndClose(() => store.toggleEnv("isPaperOut"))}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>🧻 Edge Case E2: Toggle Paper Out Lockout</span>
                <span className="text-[11px] text-[#64748b]">{store.isPaperOut ? "Paper Out" : "Normal"}</span>
              </Command.Item>
            </Command.Group>

            {/* Accessibility & Voice */}
            <Command.Group heading="Accessibility &amp; Audio" className="mt-2 px-2 py-1 text-[11px] font-bold text-[#64748b]">
              <Command.Item
                onSelect={() =>
                  runAndClose(() => {
                    const current = kannadaVoice.isEnabled();
                    kannadaVoice.setEnabled(!current);
                    if (!current) kannadaVoice.speakCustom("ಕನ್ನಡ ಧ್ವನಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ");
                  })
                }
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-emerald-400 hover:bg-[#1a2333]"
              >
                <span>🗣 Toggle Kannada Voice Announcements (ಧ್ವನಿ)</span>
                <span className="text-[11px] text-[#64748b]">
                  {kannadaVoice.isEnabled() ? "Active" : "Muted"}
                </span>
              </Command.Item>

              <Command.Item
                onSelect={() => runAndClose(() => toggleAudioMuted())}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] hover:bg-[#1a2333]"
              >
                <span>🔊 Toggle Synthesized SFX Audio</span>
                <span className="text-[11px] text-[#64748b]">
                  {isAudioMuted() ? "Muted" : "Enabled"}
                </span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runAndClose(() => {
                    playSfx("horn");
                  })
                }
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] text-amber-300 hover:bg-[#1a2333]"
              >
                <span>📢 Honk BMTC Heavy Bus Air Horn</span>
                <kbd className="text-[10px] text-[#94a3b8]">335E</kbd>
              </Command.Item>
            </Command.Group>

            {/* Deck Navigation */}
            <Command.Group heading="Jump to Presentation Slide" className="mt-2 px-2 py-1 text-[11px] font-bold text-[#64748b]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Command.Item
                  key={num}
                  onSelect={() =>
                    runAndClose(() => {
                      store.setView(store.view === "proto" ? "split" : store.view);
                      store.goToSlide(num);
                    })
                  }
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-[12.5px] hover:bg-[#1a2333]"
                >
                  <span>Slide {num}: {getSlideName(num)}</span>
                  <span className="text-[10px] text-[#64748b]">Slide {num}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[#1e293b] px-4 py-2 text-[11px] text-[#64748b]">
            <div className="flex items-center gap-2">
              <span>↑↓ Navigate</span>
              <span>·</span>
              <span>↵ Execute</span>
            </div>
            <span>Press ESC or click outside to dismiss</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function getSlideName(num: number): string {
  const names = [
    "Executive Summary & Winning Thesis",
    "Field Grounding & Hardware Failures",
    "First-Principles Reframe (Destination vs Fare)",
    "Environmental Constraints & Assumptions",
    "3-Tap, 3.3-Second Architecture",
    "High-Fidelity UI Specs & Screen Annotations",
    "Thumb Reachability Strategy & Fitts's Law",
    "Edge Cases & Product Resilience Matrix",
    "Timed Walkthrough Proof & 30s Video Script",
    "Field Validation Plan & Interview Defense Guide",
  ];
  return names[num - 1] || `Slide ${num}`;
}
