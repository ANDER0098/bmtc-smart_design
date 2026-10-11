"use client";

/* ============================================================
   ETM HARDWARE SIMULATOR — left pane
   3D tilt shell · thermal printer with scannable QR · spring
   screen transitions · Ghost-Hand replay · Nielsen spotlighting
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEtm, type FareStop } from "@/lib/etm-store";
import { FARE_LADDER, STAGES, BMTC_CONFIG } from "@/lib/config";
import { playSfx, toggleAudioMuted } from "@/lib/audio";
import { toast } from "sonner";
import { ConfettiBurst } from "@/components/fx/visuals";
import ReceiptQrCode from "@/components/etm/ReceiptQrCode";
import GhostHandReplay from "@/components/etm/GhostHandReplay";
import Odometer from "@/components/fx/Odometer";

/* ------------------------------------------------------------
   small helpers & springs
------------------------------------------------------------ */
const fmtClock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `00:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

const spring = { type: "spring", stiffness: 320, damping: 26 } as const;
const softSpring = { type: "spring", stiffness: 180, damping: 22 } as const;

/* screen slide direction variants */
const screenVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 84 : -84, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -84 : 84, opacity: 0, scale: 0.98 }),
};

/* ------------------------------------------------------------
   STOPWATCH HUD (with Rolling Odometer)
------------------------------------------------------------ */
function StopwatchHud() {
  const elapsedMs = useEtm((s) => s.elapsedMs);
  const lap1 = useEtm((s) => s.lap1);
  const lap2 = useEtm((s) => s.lap2);
  const lap3 = useEtm((s) => s.lap3);
  const running = useEtm((s) => s.timerRunning);
  const bench = useEtm((s) => s.benchResult);

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#222d3d] bg-[#0f141d]/90 p-3.5 backdrop-blur-md"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#64748b]">
          Live Speed Benchmark
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={bench ? (bench.passed ? "pass" : "fail") : running ? "run" : "idle"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={spring}
            className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${
              bench
                ? bench.passed
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                : running
                  ? "border-sky-400/40 bg-sky-400/15 text-sky-300"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {bench
              ? bench.passed
                ? `✓ ${bench.total}s < 4.0s PASSED`
                : `⚠ ${bench.total}s OVER LIMIT`
              : running
                ? "RUNNING…"
                : "BENCHMARK: < 4.0s"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <div className="font-mono-tech text-[22px] font-extrabold tracking-tight" style={{ color: bench && !bench.passed ? "#fbbf24" : "#38bdf8" }}>
          {bench ? (
            <Odometer value={`${bench.total}s`} height={26} />
          ) : (
            fmtClock(elapsedMs)
          )}
        </div>
        <span className="font-mono-tech text-[10.5px] text-[#94a3b8]">
          T1 {lap1}s · T2 {lap2}s · T3 {lap3}s
        </span>
      </div>

      {/* Progress bar vs 4s limit */}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1e2638]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-sky-300"
          animate={{
            width: bench
              ? bench.passed
                ? `${Math.min(100, (parseFloat(bench.total) / 4) * 100)}%`
                : "100%"
              : `${Math.min(100, (elapsedMs / 4000) * 100)}%`,
          }}
          transition={{ duration: 0.12, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   TOOL CHIPS & STRESS SLIDERS
------------------------------------------------------------ */
function Chip({
  label,
  active,
  alert,
  onClick,
}: {
  label: string;
  active?: boolean;
  alert?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      transition={spring}
      onClick={onClick}
      className={`flex-1 whitespace-nowrap rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-colors ${
        active
          ? alert
            ? "border-red-500 bg-red-500/15 text-red-300"
            : "border-[#3b82f6] bg-[#3b82f6]/15 text-sky-300"
          : "border-[#222d3d] bg-[#151c27] text-[#94a3b8] hover:border-[#64748b] hover:text-white"
      }`}
    >
      {label}
    </motion.button>
  );
}

function SimTools() {
  const s = useEtm();
  const [showDials, setShowDials] = useState(false);

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-1.5">
      <div className="flex gap-1.5">
        <Chip label="📐 Thumb Arcs" active={s.thumbOverlay} onClick={() => s.toggleEnv("thumbOverlay")} />
        <Chip label="☀️ Glare" active={s.glare} onClick={() => s.toggleEnv("glare")} />
        <Chip label="🚌 Bus Sway" active={s.sway} onClick={() => s.toggleEnv("sway")} />
        <Chip
          label={s.lefty ? "🤚 Left-Hand" : "✋ Right-Hand"}
          active={s.lefty}
          onClick={() => s.toggleEnv("lefty")}
        />
      </div>

      <div className="flex gap-1.5">
        <Chip label="E1: Offline" alert active={s.isOffline} onClick={() => s.toggleEnv("isOffline")} />
        <Chip label="E2: Paper Out" alert active={s.isPaperOut} onClick={() => s.toggleEnv("isPaperOut")} />
        <Chip label="E3: GPS Lost" alert active={false} onClick={() => s.openSheet("gps")} />
        <Chip label="E4: Void" alert active={false} onClick={() => s.openSheet("void")} />
        <Chip label="E7: Night AAA" active={s.isNight} onClick={() => s.toggleEnv("isNight")} />
      </div>

      {/* Stress Dials Accordion Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowDials(!showDials)}
          className="text-[11px] font-bold text-sky-400 hover:underline"
        >
          {showDials ? "▲ Hide Stress Dials" : "▼ Environment Stress Sliders (Roughness / Rain)"}
        </button>

        <button
          onClick={() => s.setGhostReplayActive(!s.ghostReplayActive)}
          className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${
            s.ghostReplayActive
              ? "border-sky-400 bg-sky-500/20 text-sky-300"
              : "border-[#222d3d] bg-[#151c27] text-[#94a3b8] hover:text-white"
          }`}
        >
          {s.ghostReplayActive ? "Ghost Hand Active" : "👻 Ghost-Hand Replay"}
        </button>
      </div>

      {/* Stress Sliders Panel */}
      <AnimatePresence>
        {showDials && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 rounded-xl border border-[#222d3d] bg-[#121824] p-3 text-[11px]"
          >
            {/* Road Roughness Dial */}
            <div>
              <div className="flex justify-between text-[#cbd5e1]">
                <span>Road Roughness (Bangalore Potholes)</span>
                <span className="font-mono text-sky-400">{s.roadRoughness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={s.roadRoughness}
                onChange={(e) => s.setRoadRoughness(Number(e.target.value))}
                className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded bg-[#1e293b] accent-sky-400"
              />
            </div>

            {/* Rain Droplets toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#cbd5e1]">Monsoon Rain on Glass</span>
              <button
                onClick={() => s.toggleEnv("rainDroplets")}
                className={`rounded px-2 py-0.5 font-bold ${
                  s.rainDroplets
                    ? "bg-sky-500 text-black"
                    : "border border-[#222d3d] bg-[#151c27] text-[#94a3b8]"
                }`}
              >
                {s.rainDroplets ? "Rain ON" : "Rain OFF"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------
   SCREEN 1 — HOME (fare ladder)
------------------------------------------------------------ */
function ScreenHome() {
  const tapFare = useEtm((s) => s.tapFare);
  const openPassScreen = useEtm((s) => s.openPassScreen);
  const setPayment = useEtm((s) => s.setPayment);
  const openSheet = useEtm((s) => s.openSheet);
  const stageCode = useEtm((s) => s.stageCode);
  const stageName = useEtm((s) => s.stageName);
  const isOffline = useEtm((s) => s.isOffline);
  const isPaperOut = useEtm((s) => s.isPaperOut);
  const demoTarget = useEtm((s) => s.demoTarget);
  const toggleEngineeringMode = useEtm((s) => s.toggleEngineeringMode);
  const [holdingVoid, setHoldingVoid] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3-second long press on 335-E badge unlocks Engineering Mode
  const badgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = () => {
    setHoldingVoid(true);
    holdTimer.current = setTimeout(() => {
      setHoldingVoid(false);
      openSheet("void");
    }, 600);
  };
  const endHold = () => {
    setHoldingVoid(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <div className="flex h-full flex-col">
      {/* status strip */}
      <div className="status-strip flex h-8 flex-shrink-0 items-center justify-between border-b border-[var(--etm-border)] bg-[var(--etm-surface)] px-3 text-[12px] font-bold text-[var(--etm-ink-muted)]">
        <div className="flex items-center gap-2">
          <span>87% ▮▮▮</span>
          <div className="flex items-center gap-1">
            <motion.span
              className={`h-[7px] w-[7px] rounded-full ${isOffline ? "bg-amber-400" : "bg-emerald-500"}`}
              animate={isOffline ? { scale: [1, 1.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.1 }}
            />
            <span className="text-[11px]">{isOffline ? "QUEUED (3)" : "SYNCED"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openSheet("gps")}
            className="cursor-pointer rounded-md bg-[#e2e8f0] px-1.5 py-0.5 text-[11px] text-[#1e293b] transition active:scale-95 screen-body:night:bg-[#273142]"
          >
            ⌖ {stageCode} {stageName}
          </button>
          <button onClick={() => openSheet("void")} className="cursor-pointer text-[14px]" aria-label="Void ticket">
            ⚙
          </button>
        </div>
      </div>

      {/* route header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--etm-border)] bg-[var(--etm-bg)] px-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ ...spring, delay: 0.15 }}
            onPointerDown={() => {
              badgeTimer.current = setTimeout(() => {
                toggleEngineeringMode();
                toast.success("ENGINEERING MODE ACTIVATED", { icon: "🛠" });
              }, 2500);
            }}
            onPointerUp={() => {
              if (badgeTimer.current) clearTimeout(badgeTimer.current);
            }}
            onPointerLeave={() => {
              if (badgeTimer.current) clearTimeout(badgeTimer.current);
            }}
            className="cursor-pointer rounded-lg bg-[var(--etm-ink)] px-2.5 py-1.5 text-[19px] font-black text-[var(--etm-bg)] select-none"
            title="Hold 3s for Engineering Mode"
          >
            335-E
          </motion.div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-kannada), var(--font-etm)" }}>
              ಮಜೆಸ್ಟಿಕ್ → ಇ-ಸಿಟಿ
            </span>
            <span className="text-[12px] font-semibold text-[var(--etm-ink-muted)]">Majestic → Electronic City</span>
          </div>
        </div>
        {/* hold-to-void with progress ring */}
        <button
          className="hold-void relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--etm-border)] bg-[var(--etm-surface)] text-[20px] text-[var(--etm-ink-muted)]"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          aria-label="Hold for void / settings"
        >
          ⋯
          <AnimatePresence>
            {holdingVoid && (
              <motion.svg
                className="pointer-events-none absolute inset-0"
                viewBox="0 0 44 44"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke="#c0261b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={119.4}
                  initial={{ strokeDashoffset: 119.4 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.6, ease: "linear" }}
                  transform="rotate(-90 22 22)"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* touch bar */}
      <div className="flex h-6 flex-shrink-0 items-center justify-between bg-[var(--etm-surface)] px-3 text-[10.5px] font-extrabold uppercase text-[var(--etm-ink-muted)]">
        <span>Fares from here · ಇಲ್ಲಿಂದ ದರ</span>
        <span className="opacity-85">1 TAP SELECTION</span>
      </div>

      {/* fare ladder */}
      <div className="fare-ladder grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-2.5">
        {FARE_LADDER.map((stop: FareStop, i) => (
          <motion.button
            key={stop.fare}
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...softSpring, delay: 0.05 + i * 0.035 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => tapFare(stop)}
            className={`fare-tiles relative flex h-[84px] cursor-pointer flex-col justify-between rounded-[14px] border-[1.5px] p-2.5 text-left transition-colors ${
              stop.highlight
                ? "border-[#3b82f6] bg-[rgba(59,130,246,0.06)]"
                : "border-[var(--etm-border)] bg-[var(--etm-bg)] active:bg-[var(--etm-green-tint)]"
            } ${demoTarget === "fare" ? "ring-[3px] ring-sky-400/70" : ""}`}
          >
            <span className={`text-[32px] font-black leading-none ${stop.highlight ? "text-[#2563eb]" : "text-[var(--etm-ink)]"}`}>
              ₹{stop.fare}
            </span>
            <div>
              <div className="text-[13px] font-extrabold leading-tight" style={{ fontFamily: "var(--font-kannada)" }}>
                {stop.kn}
              </div>
              <div className="text-[11px] font-semibold text-[var(--etm-ink-muted)]">{stop.en}</div>
            </div>
            {stop.highlight && (
              <motion.span
                className="pointer-events-none absolute right-2 top-2 text-[9px] font-black uppercase tracking-wider text-[#3b82f6]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                frequent
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {/* secondary bar */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-2 border-t border-[var(--etm-border)] bg-[var(--etm-bg)] p-2.5 pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={openPassScreen}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-[var(--etm-border)] bg-[var(--etm-surface)] text-[13px] font-extrabold text-[var(--etm-ink)]"
        >
          🎫 PASS CHECK
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            tapFare(FARE_LADDER[2]);
            setPayment("UPI");
          }}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-[var(--etm-border)] bg-[var(--etm-surface)] text-[13px] font-extrabold text-[var(--etm-ink)]"
        >
          ▣ UPI QR
        </motion.button>
      </div>

      {/* paper out edge alert */}
      <AnimatePresence>
        {isPaperOut && (
          <motion.button
            initial={{ y: -32 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            transition={spring}
            onClick={() => openSheet("paper")}
            className="absolute inset-x-0 top-0 z-[610] bg-[#c0261b] px-2.5 py-1.5 text-center text-[11px] font-extrabold text-white"
          >
            ⚠️ THERMAL PAPER OUT — Ledger mode active. Tap options.
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------
   SCREEN 2 — COUNT + PAY
------------------------------------------------------------ */
function ScreenCountPay() {
  const { fare, destKn, destEn, pax, payMode, setPax, setPayment, issue, goHome, demoTarget } = useEtm();
  const total = fare * pax;
  const dest = `${destKn} ${destEn}`;

  const paxOptions = [
    { n: 1, label: "1" },
    { n: 2, label: "2" },
    { n: 3, label: "3" },
    { n: 4, label: "4+" },
  ];

  return (
    <div className="flex h-full flex-col bg-[var(--etm-bg)]">
      <div className="flex h-[52px] flex-shrink-0 items-center gap-3 border-b border-[var(--etm-border)] px-3">
        <motion.button
          whileTap={{ scale: 0.88, x: -3 }}
          onClick={goHome}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-[9px] border-[1.5px] border-[var(--etm-border)] bg-[var(--etm-surface)] text-[22px] font-extrabold text-[var(--etm-ink)]"
          aria-label="Back"
        >
          ‹
        </motion.button>
        <div className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-kannada), var(--font-etm)" }}>
          335-E → {dest}
        </div>
      </div>

      {/* hero total */}
      <div className="flex-shrink-0 border-b-[1.5px] border-[var(--etm-border)] bg-[var(--etm-surface)] px-4 py-3 text-center">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--etm-ink-muted)]">
          To pay · ನೀಡಬೇಕಾದ ಒಟ್ಟು
        </div>
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={total}
              initial={{ scale: 0.6, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, position: "absolute" }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
              className="text-[76px] font-black leading-none tracking-[-3px] text-[var(--etm-ink)]"
            >
              ₹{total}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.div
          key={`${pax}-${fare}-${payMode}`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="text-[15px] font-bold text-[var(--etm-ink-muted)]"
        >
          {pax} × ₹{fare} · {payMode}
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-2.5 py-3">
        <div className="text-[11px] font-extrabold uppercase text-[var(--etm-ink-muted)]">
          Passenger count · ಪ್ರಯಾಣಿಕರು
        </div>
        <div className="pax-pills grid grid-cols-4 gap-2">
          {paxOptions.map((o) => (
            <motion.button
              key={o.n}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPax(o.n)}
              className={`relative flex h-20 flex-col items-center justify-center rounded-[14px] border-2 transition-colors ${
                pax === o.n
                  ? "border-[var(--etm-green)] bg-[var(--etm-green)] text-white"
                  : "border-[var(--etm-border)] bg-[var(--etm-bg)] text-[var(--etm-ink)]"
              } ${demoTarget === "pax" && o.n === 3 ? "ring-[3px] ring-sky-400 ring-offset-1" : ""}`}
            >
              {pax === o.n && (
                <motion.span
                  layoutId="paxGlow"
                  className="pointer-events-none absolute inset-0 rounded-[12px]"
                  style={{ boxShadow: "0 6px 20px rgba(14,122,61,0.45)" }}
                />
              )}
              <span className="relative text-[30px] font-black leading-none">{o.label}</span>
              <span className="relative text-[10.5px] font-extrabold">PAX{o.n === 4 ? " · GROUP" : pax === o.n ? " ✓" : ""}</span>
            </motion.button>
          ))}
        </div>

        <div className="mt-1 text-[11px] font-extrabold uppercase text-[var(--etm-ink-muted)]">
          Payment method · ಪಾವತಿ ವಿಧಾನ
        </div>
        <div className="pay-modes grid grid-cols-3 gap-2">
          {(["Cash", "UPI", "Pass"] as const).map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.93 }}
              onClick={() => setPayment(m)}
              className={`flex h-12 items-center justify-center gap-1 rounded-[10px] border-[1.5px] text-[13px] font-extrabold transition-colors ${
                payMode === m
                  ? "border-[var(--etm-ink)] bg-[var(--etm-ink)] text-[var(--etm-bg)]"
                  : "border-[var(--etm-border)] bg-[var(--etm-surface)] text-[var(--etm-ink)]"
              }`}
            >
              {m === "Cash" ? "💵 CASH" : m === "UPI" ? "▣ UPI QR" : "🎫 PASS"}
              {payMode === m && " ✓"}
            </motion.button>
          ))}
        </div>
      </div>

      {/* giant issue CTA */}
      <div className="flex-shrink-0 border-t border-[var(--etm-border)] bg-[var(--etm-bg)] p-2.5 pb-3.5">
        <motion.button
          whileTap={{ scale: 0.965 }}
          onClick={issue}
          className={`shine-sweep flex h-[84px] w-full flex-col items-center justify-center rounded-[18px] text-white ${
            demoTarget === "issue" ? "ring-[4px] ring-sky-400 ring-offset-2" : ""
          }`}
          style={{
            background: "linear-gradient(135deg, #0e7a3d 0%, #0a6132 100%)",
            boxShadow: "0 8px 26px rgba(14,122,61,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <span className="text-[23px] font-black leading-tight">
            {payMode === "UPI" ? `SHOW QR ₹${total}` : `ISSUE ₹${total} · ${pax} PAX`}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide opacity-85">
            {payMode === "UPI" ? "Present QR to passenger" : "Tap to print ticket"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   SCREEN 3 — SUCCESS (drawn check + confetti + undo ring)
------------------------------------------------------------ */
function ScreenSuccess({ onFire }: { onFire: () => void }) {
  const { fare, pax, serial, undoSecs, undoVoid } = useEtm();
  const total = fare * pax;

  useEffect(() => {
    const id = setTimeout(onFire, 240);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-between bg-[var(--etm-bg)] px-5 pb-6 pt-10 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.08 }}>
        <div className="relative mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full border-4 border-[var(--etm-green)] bg-[var(--etm-green-tint)]">
          <motion.svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M20 6 9 17l-5-5"
              stroke="var(--etm-green)"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
            />
          </motion.svg>
          <motion.span
            className="absolute inset-0 rounded-full border-4 border-[var(--etm-green)]"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
          />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.18 }}>
        <div className="text-[42px] font-black leading-tight text-[var(--etm-ink)]">
          ₹{total} · {pax} PAX
        </div>
        <div className="mt-1 font-mono-tech text-[14px] font-bold text-[var(--etm-ink-muted)]">Ticket {serial}</div>
        <div className="mt-0.5 text-[14px] font-bold text-[var(--etm-ink-muted)]">Printed · Cash · Verified ✓</div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.3 }} className="undo-ring w-full">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={undoVoid}
          disabled={undoSecs <= 0}
          className="mx-auto flex h-14 w-full max-w-[280px] items-center justify-center gap-2.5 rounded-full border-2 border-[var(--etm-amber)] bg-[rgba(180,83,9,0.08)] text-[15px] font-extrabold text-[var(--etm-amber)] disabled:opacity-40"
        >
          <span>UNDO / VOID</span>
          <span className="relative flex h-8 w-8 items-center justify-center">
            <svg viewBox="0 0 32 32" className="pointer-events-none absolute inset-0 -rotate-90">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(180,83,9,0.25)" strokeWidth="3" />
              <motion.circle
                cx="16"
                cy="16"
                r="13"
                fill="none"
                stroke={undoSecs > 4 ? "var(--etm-green)" : undoSecs > 2 ? "var(--etm-amber)" : "var(--etm-red)"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={81.7}
                animate={{ strokeDashoffset: 81.7 * (1 - undoSecs / 8) }}
                transition={{ duration: 0.4 }}
              />
            </svg>
            <span className="font-mono-tech text-[11px] font-extrabold">{undoSecs}s</span>
          </span>
        </motion.button>
        <div className="mt-2 text-[12px] font-bold text-[var(--etm-ink-muted)]">
          Auto-resetting for next passenger…
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------
   SCREEN 4 — PASS VALIDATED
------------------------------------------------------------ */
function ScreenPass() {
  const goHome = useEtm((s) => s.goHome);
  return (
    <div className="flex h-full flex-col items-center justify-between bg-[#064e3b] px-5 pb-6 pt-10 text-center text-white">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={softSpring}>
        <motion.div
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
          animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.25)", "0 0 0 22px rgba(255,255,255,0)"] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <motion.path
              d="M20 6 9 17l-5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            />
          </svg>
        </motion.div>
        <div className="text-[13.5px] font-extrabold uppercase tracking-[0.12em] opacity-90">
          Pass validated · ಮಾನ್ಯವಾಗಿದೆ
        </div>
        <div className="mt-1.5 text-[32px] font-black">STUDENT PASS</div>
        <div className="mt-1 text-[17px] font-extrabold">VALID TILL: 30 NOV 2026</div>
        <div className="mt-2 font-mono-tech text-[12px] opacity-85">CARD ID: KA-BMTC-994821</div>
      </motion.div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={goHome}
        className="h-[60px] w-full rounded-[18px] bg-white text-[17px] font-black text-[#064e3b]"
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
      >
        DONE · NEXT PASSENGER
      </motion.button>
    </div>
  );
}

/* ------------------------------------------------------------
   BOTTOM SHEETS
------------------------------------------------------------ */
function SheetFrame({ children }: { children: React.ReactNode }) {
  const closeSheet = useEtm((s) => s.closeSheet);
  return (
    <motion.div
      className="absolute inset-0 z-[900] flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={closeSheet} />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90) {
            playSfx("tap");
            closeSheet();
          }
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative flex max-h-[80%] flex-col gap-2.5 rounded-t-[24px] border-t-2 border-[var(--etm-border)] bg-[var(--etm-bg)] p-4"
        style={{ boxShadow: "0 -14px 44px rgba(0,0,0,0.4)" }}
      >
        <div className="mx-auto h-1 w-11 rounded-full bg-[var(--etm-border)]" />
        {children}
      </motion.div>
    </motion.div>
  );
}

function Sheets() {
  const sheet = useEtm((s) => s.sheet);
  const closeSheet = useEtm((s) => s.closeSheet);
  const pickStage = useEtm((s) => s.pickStage);
  const confirmVoid = useEtm((s) => s.confirmVoid);
  const enableLedger = useEtm((s) => s.enableLedger);
  const stageCode = useEtm((s) => s.stageCode);

  return (
    <AnimatePresence>
      {sheet === "gps" && (
        <SheetFrame key="gps">
          <div className="text-[16px] font-extrabold text-[var(--etm-ink)]">📍 Select Stage (Manual Fallback)</div>
          <p className="text-[12px] text-[var(--etm-ink-muted)]">GPS degraded. Fares recompute automatically:</p>
          {STAGES.map((st) => (
            <motion.button
              key={st.code}
              whileTap={{ scale: 0.97 }}
              onClick={() => pickStage(st.code, st.name)}
              className={`rounded-lg border p-3 text-left font-bold ${
                st.code === stageCode
                  ? "border-[#3b82f6] bg-[rgba(59,130,246,0.08)] text-[#3b82f6]"
                  : "border-[var(--etm-border)] text-[var(--etm-ink)]"
              }`}
            >
              {st.code} {st.name}
              {st.code === stageCode && " (Current ✓)"}
            </motion.button>
          ))}
          <button
            onClick={closeSheet}
            className="mt-1 w-full rounded-lg border border-[var(--etm-border)] bg-[var(--etm-surface)] py-2.5 text-[13px] font-bold text-[var(--etm-ink)]"
          >
            Close
          </button>
        </SheetFrame>
      )}

      {sheet === "void" && (
        <SheetFrame key="void">
          <div className="text-[16px] font-extrabold text-[#c0261b]">⚠️ Void Last Ticket</div>
          <p className="text-[12px] text-[var(--etm-ink-muted)]">Ticket 335E-002184 · ₹54. Select reason:</p>
          {["Accidental mis-tap", "Passenger alighted early"].map((r) => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                confirmVoid(r);
                toast.error(`VOID RECORDED — ${r}. Audit slip dispatched.`, { icon: "⚠️" });
              }}
              className="rounded-lg border border-[var(--etm-border)] p-3 text-left font-bold text-[var(--etm-ink)]"
            >
              {r === "Accidental mis-tap" ? "Mistaken Tap / Conductor Error" : "Passenger Alighted / Cancelled"}
            </motion.button>
          ))}
          <button
            onClick={closeSheet}
            className="w-full rounded-lg border border-[var(--etm-border)] bg-[var(--etm-surface)] py-2.5 text-[13px] font-bold text-[var(--etm-ink)]"
          >
            Cancel
          </button>
        </SheetFrame>
      )}

      {sheet === "paper" && (
        <SheetFrame key="paper">
          <div className="paper-sheet text-[16px] font-extrabold text-[#c0261b]">🖨️ Thermal Paper Out</div>
          <p className="text-[12px] text-[var(--etm-ink-muted)]">
            Never halt fare collection. Switch to ledger mode:
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              enableLedger();
              toast.success("LEDGER MODE — sales continue; print summary at depot.", { icon: "📒" });
            }}
            className="flex h-[54px] items-center justify-center rounded-[16px] bg-[var(--etm-green)] text-[15px] font-black text-white"
          >
            ENABLE RECORD &amp; PRINT LATER
          </motion.button>
          <button
            onClick={closeSheet}
            className="w-full rounded-lg border border-[var(--etm-border)] bg-[var(--etm-surface)] py-2.5 text-[13px] font-bold text-[var(--etm-ink)]"
          >
            Dismiss
          </button>
        </SheetFrame>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------
   DEVICE — shell, printer, screens, overlays
------------------------------------------------------------ */
export default function DeviceSimulator() {
  const screen = useEtm((s) => s.screen);
  const issueState = useEtm((s) => s.issueState);
  const receiptOut = useEtm((s) => s.receiptOut);
  const glare = useEtm((s) => s.glare);
  const thumbOverlay = useEtm((s) => s.thumbOverlay);
  const sway = useEtm((s) => s.sway);
  const lefty = useEtm((s) => s.lefty);
  const isNight = useEtm((s) => s.isNight);
  const isOffline = useEtm((s) => s.isOffline);
  const rainDroplets = useEtm((s) => s.rainDroplets);
  const chassisLivery = useEtm((s) => s.chassisLivery);
  const ghostReplayActive = useEtm((s) => s.ghostReplayActive);
  const bootSequenceActive = useEtm((s) => s.bootSequenceActive);
  const spotlightElement = useEtm((s) => s.spotlightElement);
  const engineeringMode = useEtm((s) => s.engineeringMode);
  const toggleEngineeringMode = useEtm((s) => s.toggleEngineeringMode);
  const unlockKonami = useEtm((s) => s.unlockKonami);

  const tearTicket = useEtm((s) => s.tearTicket);
  const total = useEtm((s) => s.fare * s.pax);
  const serial = useEtm((s) => s.serial);

  const issue = useEtm((s) => s.issue);
  const goHome = useEtm((s) => s.goHome);
  const tapFare = useEtm((s) => s.tapFare);
  const setPayment = useEtm((s) => s.setPayment);
  const payMode = useEtm((s) => s.payMode);
  const pax = useEtm((s) => s.pax);
  const setPax = useEtm((s) => s.setPax);
  const openPassScreen = useEtm((s) => s.openPassScreen);
  const openSheet = useEtm((s) => s.openSheet);

  const [laserActive, setLaserActive] = useState(false);
  const triggerLaser = () => {
    setLaserActive(true);
    playSfx("tap");
    setTimeout(() => setLaserActive(false), 900);
  };

  const [crtOn, setCrtOn] = useState(true);
  const [confettiTick, setConfettiTick] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setCrtOn(false), 950);
    return () => clearTimeout(id);
  }, []);

  // Easter egg: Konami code detector
  useEffect(() => {
    const konamiSequence = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
      "b", "a"
    ];
    let konamiIdx = 0;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === konamiSequence[konamiIdx].toLowerCase()) {
        konamiIdx++;
        if (konamiIdx === konamiSequence.length) {
          unlockKonami();
          toast.success("🎮 KONAMI CODE UNLOCKED: CYBER LIVERY + DISCO MODE!", { icon: "✨" });
          konamiIdx = 0;
        }
      } else {
        konamiIdx = 0;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [unlockKonami]);

  return (
    <div className="relative flex w-full flex-col items-center gap-3 py-4">
      <StopwatchHud />
      <SimTools />

      {/* ===== hardware shell ===== */}
      <div className="relative mt-2 flex w-[416px] flex-col items-center select-none">
        <div className="w-full">
          <motion.div
            animate={sway ? { rotate: [0, -2.2, 2, -1.3, 0.8, 0], x: [0, -5, 4, -3, 2, 0] } : { rotate: 0, x: 0 }}
            transition={sway ? { repeat: Infinity, duration: 1.7, ease: "easeInOut" } : spring}
            className={`relative mx-auto w-[404px] rounded-[44px] border-[2.5px] border-[#222d3d] p-3 pb-3 transition-colors shadow-[0_28px_65px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.14)] ${chassisLivery}`}
          >
            {/* 4 Heavy-Duty Corner Rubber Bumpers with Hex Screws */}
            <div className="pointer-events-none absolute -left-1 -top-1 flex h-7 w-7 items-center justify-center rounded-tl-[24px] border-l-[3px] border-t-[3px] border-[#38465c] bg-[#141b26] shadow-md">
              <div className="h-2 w-2 rounded-full border border-zinc-700 bg-zinc-900" />
            </div>
            <div className="pointer-events-none absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-tr-[24px] border-r-[3px] border-t-[3px] border-[#38465c] bg-[#141b26] shadow-md">
              <div className="h-2 w-2 rounded-full border border-zinc-700 bg-zinc-900" />
            </div>
            <div className="pointer-events-none absolute -left-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-bl-[24px] border-l-[3px] border-b-[3px] border-[#38465c] bg-[#141b26] shadow-md">
              <div className="h-2 w-2 rounded-full border border-zinc-700 bg-zinc-900" />
            </div>
            <div className="pointer-events-none absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-br-[24px] border-r-[3px] border-b-[3px] border-[#38465c] bg-[#141b26] shadow-md">
              <div className="h-2 w-2 rounded-full border border-zinc-700 bg-zinc-900" />
            </div>

            {/* Left Flank Hardware Buttons & Grip */}
            <div className="absolute -left-3.5 top-24 flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  playSfx("tap");
                  setCrtOn(!crtOn);
                  toast(crtOn ? "Screen Awake" : "Display Standby", { icon: "⚡" });
                }}
                className="group relative flex h-10 w-3.5 items-center justify-center rounded-l-md border-y border-l border-[#334155] bg-gradient-to-r from-[#222c3b] to-[#121822] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),-2px_2px_5px_rgba(0,0,0,0.5)] active:translate-x-0.5"
                title="Physical Power Button (Standby/Wake)"
              >
                <div className="h-4 w-1 rounded-sm bg-[#475569] group-hover:bg-amber-400" />
              </button>

              <button
                onClick={() => {
                  const next = toggleAudioMuted();
                  playSfx(next ? "tap" : "chime");
                  toast(next ? "Audio Muted" : "Audio Active", { icon: next ? "🔇" : "🔊" });
                }}
                className="group relative flex h-14 w-3.5 flex-col items-center justify-between py-1.5 rounded-l-md border-y border-l border-[#334155] bg-gradient-to-r from-[#222c3b] to-[#121822] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),-2px_2px_5px_rgba(0,0,0,0.5)] active:translate-x-0.5"
                title="Physical Volume / Mute Rocker"
              >
                <span className="text-[7px] text-[#94a3b8] font-bold">+</span>
                <div className="h-0.5 w-1.5 bg-[#475569]" />
                <span className="text-[7px] text-[#94a3b8] font-bold">-</span>
              </button>

              <div className="flex h-36 w-3 flex-col justify-between py-2 rounded-l-sm bg-[#0a0d14] border-l border-y border-zinc-800">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-1 w-full bg-[#1e2736] rounded-l-sm" />
                ))}
              </div>
            </div>

            {/* Right Flank Hardware Scan Trigger & Grip */}
            <div className="absolute -right-3.5 top-32 flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  triggerLaser();
                  openPassScreen();
                  toast.success("⚡ Right Flank Barcode Trigger Activated", { icon: "🔍" });
                }}
                className="group relative flex h-14 w-4 items-center justify-center rounded-r-md border-y border-r border-amber-600 bg-gradient-to-l from-amber-500 to-amber-600 shadow-[-1px_0_0_rgba(0,0,0,0.3),2px_2px_6px_rgba(245,158,11,0.3)] active:-translate-x-0.5"
                title="High-Vis Scan Trigger Button"
              >
                <div className="flex flex-col gap-1 items-center">
                  <div className="h-1 w-2 rounded-full bg-white/70" />
                  <div className="h-1 w-2 rounded-full bg-white/70" />
                  <div className="h-1 w-2 rounded-full bg-white/70" />
                </div>
              </button>

              <div className="flex h-36 w-3 flex-col justify-between py-2 rounded-r-sm bg-[#0a0d14] border-r border-y border-zinc-800">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-1 w-full bg-[#1e2736] rounded-r-sm" />
                ))}
              </div>
            </div>

            {/* Top Barcode / QR Optical Scanner Crown */}
            <div className="relative mx-auto mb-2 flex h-8 w-[280px] items-center justify-between rounded-t-xl border-x-2 border-t-2 border-[#222d3d] bg-[#0c1017] px-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-amber-400">▲</span>
                <span className="font-mono text-[8px] font-extrabold tracking-wider text-[#64748b]">
                  LASER SCANNER
                </span>
              </div>

              {/* Optical Glass Lens Bezel */}
              <button
                onClick={() => {
                  triggerLaser();
                  openPassScreen();
                  toast.success("⚡ 2D CMOS Laser Scanner Active", { icon: "🔍" });
                }}
                className="group relative flex h-4 w-28 items-center justify-center overflow-hidden rounded border border-red-500/40 bg-[#1f0909] shadow-[inset_0_1px_3px_rgba(0,0,0,1)] hover:border-red-400"
                title="Click to trigger optical laser pass scanner"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#ef4444]" />
                {laserActive && (
                  <motion.div
                    initial={{ x: -60, opacity: 1 }}
                    animate={{ x: 60, opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 0.28, ease: "linear" }}
                    className="absolute inset-y-0 w-3 bg-red-400 blur-[1px] shadow-[0_0_10px_#ef4444]"
                  />
                )}
              </button>

              <span className="rounded bg-[#1a2332] px-1 py-0.5 font-mono text-[7.5px] font-bold text-sky-400">
                1D/2D CMOS
              </span>
            </div>

            {/* Chunky 58mm Thermal Printer Bay */}
            <div className="relative mb-2.5 rounded-2xl border-2 border-[#1c2534] bg-gradient-to-b from-[#131924] to-[#0c1017] p-2.5 shadow-[inset_0_2px_5px_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-2">
                {/* Transparent Acrylic Paper Roll Inspection Window */}
                <div
                  onClick={() => openSheet("paper")}
                  className="group relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] hover:border-sky-400"
                  title="Paper roll inspection window (Tap to open reload guide)"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-white/70 bg-gradient-to-tr from-zinc-200 to-zinc-400 shadow-sm">
                    <div className="h-2.5 w-2.5 rounded-full border border-white/40 bg-[#111]" />
                  </div>
                  <span className="absolute -bottom-1 rounded border border-emerald-500/40 bg-[#0f172a] px-1 font-mono text-[6.5px] font-bold text-emerald-400">
                    84%
                  </span>
                </div>

                {/* Center Branding & Serrated Tear Bar */}
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">🚌</span>
                    <span className="font-mono-tech text-[10px] font-extrabold tracking-[0.12em] text-[#94a3b8]">
                      BMTC SMART-ETM
                    </span>
                  </div>
                  <span className="text-[8px] font-semibold text-[#64748b]">
                    58mm HIGH-SPEED THERMAL
                  </span>

                  {/* Serrated metal tear blade guide */}
                  <div className="relative mt-1.5 h-[5px] w-full max-w-[210px] overflow-visible rounded border-b border-zinc-700 bg-zinc-950 shadow-[inset_0_2px_3px_rgba(0,0,0,1)]">
                    <div className="absolute inset-x-0 -bottom-1 h-1 bg-[repeating-linear-gradient(45deg,#475569,#475569_2px,#1e293b_2px,#1e293b_4px)] opacity-60" />
                    {/* Thermal receipt slot */}
                    <div className="absolute left-1/2 top-0 h-[5px] w-[200px] -translate-x-1/2 overflow-visible">
                      <AnimatePresence>
                        {receiptOut && (
                          <motion.div
                            initial={{ y: -30, opacity: 0, rotate: -1.5 }}
                            animate={{ y: 8, opacity: 1, rotate: 0 }}
                            exit={{ y: -40, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 130, damping: 15 }}
                            className="receipt-edge absolute left-1/2 top-0 z-[500] w-[220px] -translate-x-1/2 cursor-pointer bg-[#fafafa] p-3 pb-6 text-left font-mono-tech text-[9.5px] leading-[1.4] text-[#111418] shadow-[0_18px_38px_rgba(0,0,0,0.65)]"
                            onClick={tearTicket}
                            title="Tap to tear off ticket"
                          >
                            <div className="mb-1.5 border-b border-dashed border-[#475569] pb-1.5 text-center font-bold">
                              BMTC · BANGALORE
                              <br />
                              DEPOT-25 · ROUTE 335-E
                            </div>
                            <div>STAGE: ST-12 (Koramangala)</div>
                            <div>DEST: Madiwala (₹18)</div>
                            <div className="my-1.5 border-y border-dashed border-[#475569] py-1 text-[12px] font-extrabold">
                              {total} AMT · CASH
                            </div>
                            <div>SERIAL: {serial}</div>

                            {/* Scannable Real QR Code */}
                            <div className="my-2 flex flex-col items-center justify-center">
                              <ReceiptQrCode value={`BMTC:${serial}:FARE=${total}:ROUTE=335E`} size={86} />
                              <span className="mt-1 font-mono text-[7.5px] text-[#666]">SCAN TO AUDIT</span>
                            </div>

                            <div className="mt-1 text-center text-[8px] text-[#555]">
                              HAPPY JOURNEY · ಶುಭ ಪ್ರಯಾಣ
                            </div>
                            <div className="mt-1.5 w-full border border-dashed border-[#666] bg-[#eee] py-0.5 text-center text-[8px]">
                              [ TEAR OFF TICKET ]
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right: Hatch Latch & Status LEDs */}
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => {
                      playSfx("tap");
                      openSheet("paper");
                    }}
                    className="flex items-center gap-0.5 rounded border border-[#2a384e] bg-[#1a2332] px-1.5 py-0.5 text-[8px] font-extrabold text-emerald-400 shadow-[0_2px_0_#0f172a] hover:border-emerald-400 active:translate-y-0.5"
                    title="Pop open paper door"
                  >
                    <span>LATCH</span>
                    <span>⏏</span>
                  </button>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span className="font-mono text-[6.5px] text-[#64748b]">PWR</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="h-2 w-2 rounded-full"
                        animate={{
                          backgroundColor: issueState === "printing" ? "#f59e0b" : "#334155",
                          boxShadow: issueState === "printing" ? "0 0 8px #f59e0b" : "none",
                        }}
                        transition={issueState === "printing" ? { repeat: Infinity, duration: 0.3 } : {}}
                      />
                      <span className="font-mono text-[6.5px] text-[#64748b]">PRT</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`h-2 w-2 rounded-full ${isOffline ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" : "bg-sky-400 shadow-[0_0_6px_#38bdf8]"}`} />
                      <span className="font-mono text-[6.5px] text-[#64748b]">{isOffline ? "OFF" : "4G"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* screen */}
            <div
              className={`device-screen screen-body scanlines ${isNight ? "night" : ""} ${lefty ? "lefty" : ""}`}
              style={lefty ? { transform: "scaleX(1)" } : undefined}
            >
              {/* Boot Sequence Overlay */}
              <AnimatePresence>
                {bootSequenceActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[890] flex flex-col items-center justify-center bg-black p-6 font-mono text-emerald-400"
                  >
                    <div className="mb-4 text-center">
                      <div className="text-[20px] font-black text-white">BMTC SMART-ETM</div>
                      <div className="text-[10px] text-emerald-500">BOOT SEQUENCE INITIALIZING</div>
                    </div>
                    <div className="w-full space-y-1.5 text-[11px]">
                      <div>&gt; FLASH ROM SELF-TEST: OK</div>
                      <div>&gt; GPS FIX: 12.9716° N (BMTC ARTERY)</div>
                      <div>&gt; THERMAL PRINTER 58mm: READY</div>
                      <div>&gt; ROUTE 335-E: CACHED</div>
                      <div className="animate-pulse text-sky-400">&gt; STARTING RUNTIME…</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rain Droplets on display glass */}
              {rainDroplets && (
                <div className="pointer-events-none absolute inset-0 z-[810] opacity-40">
                  <svg className="h-full w-full">
                    {[...Array(12)].map((_, i) => (
                      <circle
                        key={i}
                        cx={`${(i * 29) % 360}px`}
                        cy={`${(i * 61) % 720}px`}
                        r={`${2 + (i % 3)}`}
                        fill="rgba(255,255,255,0.7)"
                        filter="blur(0.5px)"
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* power-on crt */}
              {crtOn && <div className="crt-on absolute inset-0 z-[860] bg-[var(--etm-bg)]" />}

              {/* glare filter */}
              <AnimatePresence>
                {glare && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-[800]"
                    style={{
                      background:
                        "linear-gradient(128deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.16) 42%, transparent 68%)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* thumb arc overlay */}
              <AnimatePresence>
                {thumbOverlay && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-[850]"
                  >
                    <div className="absolute inset-x-0 top-0 flex h-[252px] flex-col justify-end bg-[rgba(239,68,68,0.13)] p-3">
                      <svg className="absolute inset-x-0 bottom-[-2px] h-[3px] w-full" preserveAspectRatio="none">
                        <line
                          x1="0"
                          y1="1.5"
                          x2="100%"
                          y2="1.5"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeDasharray="10 8"
                          className="arc-dash"
                        />
                      </svg>
                      <span className="w-fit rounded-md bg-[#ef4444] px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-white">
                        Look zone (top 35%) · display only
                      </span>
                    </div>
                    <div
                      className={`absolute bottom-0 h-[385px] w-[295px] ${
                        lefty ? "left-0" : "right-0"
                      }`}
                      style={{
                        [lefty ? "borderTopRightRadius" : "borderTopLeftRadius"]: "100%",
                        background: lefty
                          ? "radial-gradient(circle at bottom left, rgba(16,185,129,0.30) 0%, rgba(16,185,129,0.16) 65%, transparent 100%)"
                          : "radial-gradient(circle at bottom right, rgba(16,185,129,0.30) 0%, rgba(16,185,129,0.16) 65%, transparent 100%)",
                      }}
                    >
                      <svg className={`absolute ${lefty ? "right-0" : "left-0"} h-full w-[3px]`}>
                        <line
                          x1="1.5"
                          y1="0"
                          x2="1.5"
                          y2="100%"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeDasharray="10 8"
                          className="arc-dash"
                        />
                      </svg>
                      <span
                        className={`absolute bottom-4 rounded-md bg-[#10b981] px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-white ${
                          lefty ? "left-4" : "right-4"
                        }`}
                      >
                        Natural thumb arc (touch zone)
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nielsen Heuristic Spotlight Beam */}
              <AnimatePresence>
                {spotlightElement && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-[840] ring-4 ring-sky-400 ring-offset-2 ring-offset-black"
                  >
                    <div className="absolute right-3 top-3 rounded-lg border border-sky-400 bg-sky-950/90 px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 shadow-xl">
                      🔍 SPOTLIGHT: {spotlightElement.toUpperCase()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ghost-Hand Replay Overlay */}
              <GhostHandReplay active={ghostReplayActive} />

              {/* offline banner */}
              <AnimatePresence>
                {isOffline && (
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={spring}
                    className="absolute inset-x-0 top-0 z-[605] bg-[#b45309] px-2.5 py-1 text-center text-[11px] font-extrabold text-white"
                  >
                    ● OFFLINE — Fares cached locally. Auto-sync at depot.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* screens */}
              <div style={{ perspective: 900 }} className="relative h-full flex-1">
                <AnimatePresence mode="wait" custom={screen === "home" ? -1 : 1}>
                  {screen === "home" && (
                    <motion.div
                      key="home"
                      custom={-1}
                      variants={screenVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                      className="absolute inset-0"
                    >
                      <ScreenHome />
                    </motion.div>
                  )}
                  {screen === "count" && (
                    <motion.div
                      key="count"
                      custom={1}
                      variants={screenVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                      className="absolute inset-0"
                    >
                      <ScreenCountPay />
                    </motion.div>
                  )}
                  {screen === "success" && (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0 }}
                      transition={softSpring}
                      className="absolute inset-0"
                    >
                      <ConfettiBurst trigger={confettiTick} />
                      <ScreenSuccess onFire={() => setConfettiTick((t) => t + 1)} />
                    </motion.div>
                  )}
                  {screen === "pass" && (
                    <motion.div
                      key="pass"
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0 }}
                      transition={softSpring}
                      className="absolute inset-0"
                    >
                      <ScreenPass />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* printing overlay */}
              <AnimatePresence>
                {issueState === "printing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[600] flex flex-col items-center justify-center gap-4 bg-[rgba(17,20,24,0.88)] p-6 backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ y: 18, rotate: -1 }}
                      animate={{ y: 0, rotate: 0 }}
                      transition={softSpring}
                      className="w-[260px] rounded-xl border-2 border-dashed border-[#94a3b8] bg-white p-4 font-mono-tech text-[11px] text-[#111]"
                    >
                      <div className="mb-1.5 border-b border-dashed border-[#333] pb-1 text-center font-extrabold">
                        BMTC SMART-ETM · ROUTE 335-E
                      </div>
                      <div className="flex justify-between">
                        <span>STAGE: ST-12</span>
                        <span>Madiwala</span>
                      </div>
                      <div className="my-1.5 text-[14px] font-black">₹{total} · 3 PAX · CASH</div>
                      <div className="text-[9.5px] text-[#666]">SERIAL: {serial} · PRINTING…</div>
                    </motion.div>
                    <div className="h-3 w-[260px] overflow-hidden rounded-full bg-white/25">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.15, ease: "linear" }}
                      />
                    </div>
                    <span className="text-[12px] text-[#94a3b8]">Thermal head active — hold to cancel (500ms)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* sheets */}
              <Sheets />
            </div>

            {/* ============================================================
                CONDUCTOR'S TACTILE HARDWARE KEYPAD & CONTROL CHIN
                (Physical buttons for bumpy Bangalore bus roads)
                ============================================================ */}
            <div className="mt-2.5 rounded-2xl border-2 border-[#1e2738] bg-gradient-to-b from-[#111722] to-[#090d14] p-2.5 shadow-[inset_0_2px_5px_rgba(255,255,255,0.06),0_6px_16px_rgba(0,0,0,0.6)]">
              {/* Keypad Header with Tactile Label */}
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="font-mono text-[8.5px] font-extrabold uppercase tracking-wider text-[#64748b]">
                  TACTILE HARDWARE CONTROLS · ಕೀಪ್ಯಾಡ್
                </span>
                <span className="rounded bg-[#1e2738] px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-400">
                  POTHOLE-SAFE
                </span>
              </div>

              {/* Row 1: Primary Mechanical Action Keys */}
              <div className="grid grid-cols-4 gap-1.5">
                {/* 🟢 PRINT / ISSUE */}
                <button
                  onClick={() => {
                    playSfx("tap");
                    if (screen === "home") {
                      tapFare(FARE_LADDER[1]);
                    } else if (screen === "count") {
                      issue();
                    } else {
                      goHome();
                    }
                  }}
                  className="group relative flex h-11 flex-col items-center justify-center rounded-xl border border-emerald-400/40 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-[0_3px_0_#064e3b,0_5px_8px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[0_1px_0_#064e3b]"
                  title="Physical PRINT / ISSUE Key"
                >
                  <span className="text-[11px] font-black leading-none tracking-wide">ISSUE</span>
                  <span className="text-[8px] font-bold opacity-80">ಮುದ್ರಿಸು [P]</span>
                  <div className="absolute right-1 top-1 h-1 w-1 rounded-full bg-white/60" />
                </button>

                {/* 🔴 CANCEL / CLEAR */}
                <button
                  onClick={() => {
                    playSfx("tap");
                    goHome();
                  }}
                  className="flex h-11 flex-col items-center justify-center rounded-xl border border-red-500/40 bg-gradient-to-b from-red-600 to-red-800 text-white shadow-[0_3px_0_#7f1d1d,0_5px_8px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[0_1px_0_#7f1d1d]"
                  title="Physical CANCEL / CLEAR Key"
                >
                  <span className="text-[11px] font-black leading-none tracking-wide">CANCEL</span>
                  <span className="text-[8px] font-bold opacity-80">ರದ್ದು [C]</span>
                </button>

                {/* 🟡 FEED */}
                <button
                  onClick={() => {
                    playSfx("motor");
                    toast.info("📄 Paper Motor: Fed 30mm blank receipt", { icon: "🖨" });
                  }}
                  className="flex h-11 flex-col items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-600 to-amber-800 text-white shadow-[0_3px_0_#78350f,0_5px_8px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f]"
                  title="Physical Thermal Paper Feed Key"
                >
                  <span className="text-[11px] font-black leading-none tracking-wide">FEED</span>
                  <span className="text-[8px] font-bold opacity-80">ಪೇಪರ್ [F]</span>
                </button>

                {/* ⚡ SCAN */}
                <button
                  onClick={() => {
                    triggerLaser();
                    openPassScreen();
                  }}
                  className="flex h-11 flex-col items-center justify-center rounded-xl border border-sky-400/40 bg-gradient-to-b from-sky-600 to-sky-800 text-white shadow-[0_3px_0_#075985,0_5px_8px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[0_1px_0_#075985]"
                  title="Physical Barcode / Pass Scan Key"
                >
                  <span className="text-[11px] font-black leading-none tracking-wide">SCAN</span>
                  <span className="text-[8px] font-bold opacity-80">ಸ್ಕ್ಯಾನ್ [S]</span>
                </button>
              </div>

              {/* Row 2: Payment Shortcuts & Bus Horn */}
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    playSfx("pop");
                    setPayment("Cash");
                    toast("💵 Payment: CASH", { icon: "💵" });
                  }}
                  className={`flex h-8 items-center justify-center gap-1 rounded-lg border text-[9.5px] font-extrabold shadow-[0_2px_0_#0a0f17] active:translate-y-0.5 ${
                    payMode === "Cash"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                      : "border-[#283548] bg-[#17202d] text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <span>💵</span> CASH
                </button>

                <button
                  onClick={() => {
                    playSfx("pop");
                    setPayment("UPI");
                    toast("▣ Payment: DYNAMIC UPI QR", { icon: "▣" });
                  }}
                  className={`flex h-8 items-center justify-center gap-1 rounded-lg border text-[9.5px] font-extrabold shadow-[0_2px_0_#0a0f17] active:translate-y-0.5 ${
                    payMode === "UPI"
                      ? "border-sky-400 bg-sky-500/20 text-sky-300"
                      : "border-[#283548] bg-[#17202d] text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <span>▣</span> UPI
                </button>

                <button
                  onClick={() => {
                    playSfx("tap");
                    openPassScreen();
                  }}
                  className="flex h-8 items-center justify-center gap-1 rounded-lg border border-[#283548] bg-[#17202d] text-[9.5px] font-extrabold text-[#94a3b8] shadow-[0_2px_0_#0a0f17] hover:text-white active:translate-y-0.5"
                >
                  <span>🎫</span> PASS
                </button>

                <button
                  onClick={() => {
                    playSfx("horn");
                    toast("🚌 BMTC ROUTE 335-E AIR HORN!", { icon: "📢" });
                  }}
                  className="flex h-8 items-center justify-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/15 text-[9.5px] font-extrabold text-amber-300 shadow-[0_2px_0_#0a0f17] hover:bg-amber-500/25 active:translate-y-0.5"
                  title="Bus Horn Easter Egg"
                >
                  <span>📢</span> HORN
                </button>
              </div>

              {/* Row 3: Conductor Passenger Count Chiclets */}
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      playSfx("pop");
                      setPax(n);
                    }}
                    className={`flex h-7 items-center justify-center rounded-lg border font-mono text-[10px] font-extrabold shadow-[0_2px_0_#0a0f17] active:translate-y-0.5 ${
                      pax === n
                        ? "border-sky-400 bg-sky-500/25 text-white"
                        : "border-[#222c3c] bg-[#141b26] text-[#64748b] hover:text-white"
                    }`}
                  >
                    {n === 4 ? "4+ GRP" : `${n} PAX`}
                  </button>
                ))}
              </div>

              {/* Speaker Grille & Brushed Asset Plaque */}
              <div className="mt-2.5 flex items-center justify-between border-t border-[#1e2738] pt-2 px-1">
                {/* Acoustic Circular Speaker Grille (12 ports) */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-1 w-1 rounded-full bg-[#2a364a]" />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-1 w-1 rounded-full bg-[#2a364a]" />
                    ))}
                  </div>
                </div>

                {/* Official BMTC Asset Identification Plaque */}
                <div className="rounded border border-[#334155] bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 px-2 py-0.5 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
                  <span className="font-mono text-[7.5px] font-extrabold tracking-wider text-zinc-300">
                    BMTC · DEPOT-25 · ASSET #KA-01-ETM-2184
                  </span>
                </div>

                {/* Magnetic Charging Cradle Contacts (Gold Pogo Pins) */}
                <div className="flex items-center gap-1.5" title="Magnetic charging dock pogo pins">
                  <div className="h-2 w-2 rounded-full border border-amber-600 bg-amber-400 shadow-[0_0_3px_#f59e0b]" />
                  <div className="h-2 w-2 rounded-full border border-amber-600 bg-amber-400 shadow-[0_0_3px_#f59e0b]" />
                </div>
              </div>
            </div>

            {/* Bottom Base details & Lanyard Anchor Loop */}
            <div className="mt-1 flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-5 rounded-full border-2 border-[#334155] bg-black/60" title="Heavy-duty wrist strap anchor" />
                <span className="font-mono text-[7px] text-[#475569]">STRAP</span>
              </div>

              <div className="h-1.5 w-16 rounded-full bg-[#0a0d14] border border-zinc-800" />

              <div className="flex items-center gap-1">
                <span className="font-mono text-[7px] text-[#475569]">5V ⎓ 3A</span>
                <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Engineering Mode Drawer Modal */}
      <AnimatePresence>
        {engineeringMode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="w-full max-w-[400px] rounded-2xl border border-purple-500/50 bg-[#120a1f]/95 p-4 text-[12px] text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <span className="font-mono font-bold text-purple-300">🛠 ENGINEERING MODE DIAGNOSTICS</span>
              <button onClick={toggleEngineeringMode} className="text-[#94a3b8] hover:text-white">✕</button>
            </div>
            <div className="mt-2.5 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">State Machine Screen:</span>
                <span className="text-emerald-400">{screen.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Contrast Polarity:</span>
                <span className="text-sky-300">{isNight ? "Night AAA (14.2:1)" : "Daylight High-Vis"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">WCAG 2.2 Level:</span>
                <span className="rounded bg-emerald-500/20 px-1 text-emerald-300">AAA PASSED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">FPS / RAF Throttle:</span>
                <span className="text-amber-400">60.0 FPS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* caption */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="max-w-[400px] text-center text-[11.5px] text-[#64748b]"
      >
        360 × 720 dp · 5.5&quot; rugged handheld · 58mm thermal · tilt me, I&apos;m springy
      </motion.p>
    </div>
  );
}
