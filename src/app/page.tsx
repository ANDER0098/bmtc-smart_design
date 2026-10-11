"use client";

/* ============================================================
   THE CONDUCTOR'S DIGITAL COMPANION — main composition
   Multi-theming, ⌘K command palette, A/B race mode,
   Nielsen inspector, Route 335-E living map, and shift ledger.
   ============================================================ */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import NodeNetwork from "@/components/fx/NodeNetwork";
import { AuroraBackground, Magnetic } from "@/components/fx/visuals";
import DeviceSimulator from "@/components/etm/DeviceSimulator";
import CaseStudyDeck from "@/components/deck/CaseStudyDeck";
import CommandPalette from "@/components/etm/CommandPalette";
import RaceMode from "@/components/etm/RaceMode";
import NielsenInspector from "@/components/etm/NielsenInspector";
import RouteMap from "@/components/etm/RouteMap";
import LedgerDrawer from "@/components/etm/LedgerDrawer";
import BenchmarkHistory from "@/components/etm/BenchmarkHistory";
import ThemeSwitcher from "@/components/etm/ThemeSwitcher";
import { useEtm, type ViewMode } from "@/lib/etm-store";
import { playSfx, toggleAudioMuted, isAudioMuted } from "@/lib/audio";
import { kannadaVoice } from "@/lib/voice";

const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "split", label: "Split View", icon: "M12 3v18M3 3h18v18H3z" },
  { id: "proto", label: "Device Simulator", icon: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" },
  { id: "deck", label: "Presentation Deck", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
];

export default function Page() {
  const view = useEtm((s) => s.view);
  const setView = useEtm((s) => s.setView);
  const runAutoDemo = useEtm((s) => s.runAutoDemo);
  const triggerBootSequence = useEtm((s) => s.triggerBootSequence);
  const chassisLivery = useEtm((s) => s.chassisLivery);
  const setChassisLivery = useEtm((s) => s.setChassisLivery);
  const setSpotlightElement = useEtm((s) => s.setSpotlightElement);
  const spotlightElement = useEtm((s) => s.spotlightElement);

  // Modals & Panels State
  const [cmdOpen, setCmdOpen] = useState(false);
  const [raceOpen, setRaceOpen] = useState(false);
  const [nielsenOpen, setNielsenOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [benchOpen, setBenchOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  // Audio / Voice state
  const [muted, setMuted] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    setMuted(isAudioMuted());
    setVoiceActive(kannadaVoice.isEnabled());
  }, []);

  const handleToggleVoice = () => {
    playSfx("tap");
    const next = !voiceActive;
    setVoiceActive(next);
    kannadaVoice.setEnabled(next);
    if (next) {
      toast.success("ಕನ್ನಡ ಧ್ವನಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ (Kannada Voice Enabled)", { icon: "🗣" });
      kannadaVoice.speakCustom("ನಮಸ್ಕಾರ, ಬಿ.ಎಂ.ಟಿ.ಸಿ ಡಿಜಿಟಲ್ ಕಂಡಕ್ಟರ್ ಸಕ್ರಿಯವಾಗಿದೆ");
    } else {
      toast.info("Kannada Voice Muted");
    }
  };

  const handleToggleSound = () => {
    const next = toggleAudioMuted();
    setMuted(next);
    if (!next) playSfx("chime");
    toast(next ? "SFX Audio Muted" : "SFX Audio Enabled", { icon: next ? "🔇" : "🔊" });
  };

  return (
    <div className="relative min-h-screen">
      {/* Film grain aesthetic overlay */}
      <div className="film-grain-overlay" aria-hidden="true" />

      {/* Visual background layers */}
      <AuroraBackground />
      <NodeNetwork />
      <Toaster position="top-center" richColors closeButton theme="dark" />

      {/* ⌘K Command Palette */}
      <CommandPalette
        open={cmdOpen}
        setOpen={setCmdOpen}
        onOpenRace={() => setRaceOpen(true)}
        onOpenLedger={() => setLedgerOpen(true)}
        onOpenInspector={() => setNielsenOpen(true)}
        onOpenMap={() => setMapOpen(true)}
        onOpenBenchChart={() => setBenchOpen(true)}
      />

      <div className="relative z-10">
        {/* ============================================================
           HEADER
           ============================================================ */}
        <motion.header
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="no-print sticky top-0 z-[1000] border-b border-[#222d3d] bg-[#0f141de8] backdrop-blur-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
          <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-7">
            {/* Brand Title */}
            <div className="flex items-center gap-3.5">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={triggerBootSequence}
                className="badge-animated cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_2px_12px_rgba(37,99,235,0.4)]"
                title="Click to trigger ETM Boot Sequence"
              >
                Nielsen Assignment
              </motion.button>
              <div>
                <h1 className="flex items-center gap-2 text-[15.5px] font-extrabold text-white md:text-[16px]">
                  The Conductor&apos;s Digital Companion
                  <span className="rounded bg-[#0e7a3d] px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
                    BMTC SMART-ETM
                  </span>
                </h1>
                <p className="text-[11.5px] font-medium text-[#94a3b8]">
                  Route 335-E · 3 Taps &lt;4s · Biomechanical Reachability Architecture
                </p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Feature Modals Launchers */}
              <div className="hidden items-center gap-1.5 xl:flex">
                <button
                  onClick={() => {
                    playSfx("tap");
                    setRaceOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11.5px] font-bold text-amber-300 transition hover:bg-amber-500/20"
                >
                  <span>🏁</span> Speed Race
                </button>

                <button
                  onClick={() => {
                    playSfx("tap");
                    setNielsenOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[11.5px] font-bold text-sky-300 transition hover:bg-sky-500/20"
                >
                  <span>🔍</span> 10 Heuristics
                </button>

                <button
                  onClick={() => {
                    playSfx("tap");
                    setMapOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11.5px] font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <span>🗺</span> 335-E Map
                </button>

                <button
                  onClick={() => {
                    playSfx("tap");
                    setLedgerOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-[11.5px] font-bold text-purple-300 transition hover:bg-purple-500/20"
                >
                  <span>📊</span> Day-Sheet
                </button>

                <button
                  onClick={() => {
                    playSfx("tap");
                    setBenchOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-[#222d3d] bg-[#151c27] px-2.5 py-1.5 text-[11.5px] font-bold text-[#94a3b8] transition hover:text-white"
                >
                  <span>📈</span> Telemetry
                </button>
              </div>

              {/* Toggles: Kannada Voice & SFX Mute */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleVoice}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold transition ${
                    voiceActive
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "border-[#222d3d] bg-[#151c27] text-[#94a3b8] hover:text-white"
                  }`}
                  title="Toggle Kannada Voice Announcements"
                >
                  <span>🗣</span>
                  <span className="hidden sm:inline">ಧ್ವನಿ {voiceActive ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={handleToggleSound}
                  className={`flex items-center justify-center rounded-lg border p-1.5 text-[12px] font-bold transition ${
                    muted
                      ? "border-red-500/40 bg-red-500/15 text-red-300"
                      : "border-[#222d3d] bg-[#151c27] text-[#94a3b8] hover:text-white"
                  }`}
                  title={muted ? "Unmute Sound" : "Mute Sound"}
                >
                  {muted ? "🔇" : "🔊"}
                </button>

                {/* Theme Switcher Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setThemeOpen(!themeOpen)}
                    className="flex items-center justify-center rounded-lg border border-[#222d3d] bg-[#151c27] p-1.5 text-[12px] font-bold text-[#94a3b8] hover:text-white"
                    title="Theme & Livery Options"
                  >
                    🎨
                  </button>

                  <AnimatePresence>
                    {themeOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        className="absolute right-0 top-10 z-[1200] w-[310px]"
                      >
                        <ThemeSwitcher
                          currentLivery={chassisLivery}
                          onLiveryChange={(l) => {
                            setChassisLivery(l);
                            setThemeOpen(false);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ⌘K Trigger Button */}
                <button
                  onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#222d3d] bg-[#151c27] px-2.5 py-1.5 text-[12px] font-bold text-[#94a3b8] hover:border-sky-500 hover:text-white"
                  title="Command Palette (Cmd+K / Ctrl+K)"
                >
                  <span>⌘K</span>
                </button>
              </div>

              {/* View Toggles (Split, Simulator, Deck) */}
              <div className="flex rounded-xl border border-[#222d3d] bg-[#151c27] p-[3px]">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      playSfx("tap");
                      setView(v.id);
                    }}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors md:px-3.5 ${
                      view === v.id ? "text-white" : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    {view === v.id && (
                      <motion.span
                        layoutId="viewPill"
                        className="absolute inset-0 rounded-lg bg-[#3b82f6] shadow-[0_2px_14px_rgba(59,130,246,0.45)]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative">
                      <path d={v.icon} />
                    </svg>
                    <span className="relative hidden sm:inline">{v.label}</span>
                  </button>
                ))}
              </div>

              {/* Auto Play Demo CTA */}
              <div className="hidden items-center gap-2 md:flex">
                <Magnetic strength={0.25}>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={runAutoDemo}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3.5 py-1.5 text-[12px] font-extrabold text-white shadow-[0_2px_14px_rgba(16,185,129,0.4)]"
                  >
                    <motion.svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </motion.svg>
                    Auto-Play 3.3s Demo
                  </motion.button>
                </Magnetic>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ============================================================
           MODAL OVERLAYS
           ============================================================ */}
        <AnimatePresence>
          {raceOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setRaceOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[1240px]">
                <RaceMode onClose={() => setRaceOpen(false)} />
              </div>
            </motion.div>
          )}

          {nielsenOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setNielsenOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="h-[80vh] w-full max-w-[650px]">
                <NielsenInspector
                  activeHeuristicId={spotlightElement}
                  onSelectHeuristic={(id) => {
                    const targetEl = id ? id.toLowerCase() : null;
                    setSpotlightElement(targetEl);
                  }}
                  onClose={() => {
                    setSpotlightElement(null);
                    setNielsenOpen(false);
                  }}
                />
              </div>
            </motion.div>
          )}

          {mapOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setMapOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px]">
                <RouteMap onClose={() => setMapOpen(false)} />
              </div>
            </motion.div>
          )}

          {ledgerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setLedgerOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[960px]">
                <LedgerDrawer onClose={() => setLedgerOpen(false)} />
              </div>
            </motion.div>
          )}

          {benchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setBenchOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[600px]">
                <BenchmarkHistory onClose={() => setBenchOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================
           MASTER GRID
           ============================================================ */}
        <main
          className={`master-grid mx-auto max-w-[1720px] ${view === "proto" ? "mode-proto" : view === "deck" ? "mode-deck" : ""}`}
        >
          {/* LEFT — simulator */}
          <section className="sim-pane-clip" aria-label="ETM device simulator">
            <AnimatePresence>
              {view !== "deck" && (
                <motion.aside
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`nice-scroll relative flex h-full flex-col items-center bg-[#0b0e14cc] px-4 py-4 backdrop-blur-sm ${
                    view === "proto" ? "w-full border-r-0 justify-center" : "w-[490px] border-r border-[#222d3d]"
                  }`}
                  style={{ maxWidth: "100vw", minHeight: "calc(100vh - 64px)" }}
                >
                  <DeviceSimulator />
                </motion.aside>
              )}
            </AnimatePresence>
          </section>

          {/* RIGHT — deck */}
          <section className="deck-pane-clip" aria-label="Case study presentation deck">
            <AnimatePresence>
              {view !== "proto" && (
                <motion.main
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="nice-scroll h-full px-4 py-6 md:px-9"
                  style={{ minHeight: "calc(100vh - 64px)" }}
                >
                  <CaseStudyDeck />
                </motion.main>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
}
