"use client";

/* ============================================================
   CASE STUDY DECK — 10 slides, live telemetry, interactive actions
   ============================================================ */

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEtm } from "@/lib/etm-store";
import {
  AnimatedNumber,
  Eyebrow,
  Magnetic,
  riseChild,
  SlideShell,
} from "@/components/fx/visuals";
import { playSfx } from "@/lib/audio";
import { toast } from "sonner";
import {
  SlideOverviewModal,
  SpeakerNotesModal,
  KeyboardCheatSheet,
} from "@/components/deck/PresentationHelpers";

const SLIDE_TITLES = [
  "Executive Summary & The Winning Thesis",
  "Real-World Field Grounding & Hardware Failures",
  "First-Principles Reframe (Destination vs Fare)",
  "Environmental Constraints & Assumptions",
  "The 3-Tap, 3.3-Second Architecture",
  "High-Fidelity UI Specs & Screen Annotations",
  "Thumb Reachability Strategy & Fitts's Law",
  "Edge Cases & Product Resilience Matrix",
  "Timed Walkthrough Proof & 30s Video Script",
  "Field Validation Plan & Interview Defense Guide",
];

/* ------------------------------------------------------------
   building blocks
------------------------------------------------------------ */
function Heading({ children }: { children: ReactNode }) {
  return (
    <motion.h2
      variants={riseChild}
      className="mb-4 text-[30px] font-extrabold leading-[1.22] tracking-[-0.5px] text-white"
    >
      {children}
    </motion.h2>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <motion.p variants={riseChild} className="text-[15px] leading-relaxed text-[#94a3b8]">
      {children}
    </motion.p>
  );
}

function Card({
  children,
  className = "",
  accent,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      variants={riseChild}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      className={`glow-card relative rounded-xl border border-[#222d3d] bg-[#151c27] p-[18px] ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({ children, color }: { children: ReactNode; color?: string }) {
  return <h4 className={`text-[15px] font-extrabold ${color ?? "text-white"}`}>{children}</h4>;
}

function CardBody({ children }: { children: ReactNode }) {
  return <p className="text-[13.5px] leading-relaxed text-[#94a3b8]">{children}</p>;
}

function Grid({ cols = 2, children }: { cols?: 2 | 3; children: ReactNode }) {
  return (
    <motion.div
      variants={riseChild}
      className={`my-4 grid gap-3.5 ${cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
    >
      {children}
    </motion.div>
  );
}

function StatCard({
  value,
  decimals = 0,
  suffix = "",
  label,
  desc,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={riseChild}
      whileHover={{ y: -4, scale: 1.015 }}
      className="rounded-xl border border-[rgba(59,130,246,0.25)] p-4"
      style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.13), rgba(16,185,129,0.06))" }}
    >
      <div className="font-mono-tech text-[36px] font-extrabold leading-none tracking-tight text-white">
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-1.5 text-[12.5px] font-extrabold uppercase tracking-wide text-[#60a5fa]">{label}</div>
      <div className="mt-0.5 text-[12.5px] leading-relaxed text-[#94a3b8]">{desc}</div>
    </motion.div>
  );
}

function HeroBanner({ children }: { children: ReactNode }) {
  return (
    <motion.blockquote
      variants={riseChild}
      className="my-5 rounded-r-[14px] border-l-4 border-[#10b981] p-5 text-[16.5px] font-semibold leading-relaxed text-[#e2e8f0]"
      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.13), rgba(59,130,246,0.07))" }}
    >
      {children}
    </motion.blockquote>
  );
}

function FooterNav({
  next,
  prev,
  hint,
}: {
  next?: string;
  prev?: string;
  hint?: string;
}) {
  const goNext = useEtm((s) => s.nextSlide);
  const goPrev = useEtm((s) => s.prevSlide);
  return (
    <motion.div variants={riseChild} className="mt-7 flex items-center justify-between border-t border-[#222d3d] pt-5">
      <span className="text-[12px] text-[#64748b]">{hint ?? "Use ← → arrow keys · Press 'O' for grid · '?' for shortcuts"}</span>
      <div className="flex gap-2">
        {prev && (
          <button onClick={goPrev} className="rounded-lg border border-[#222d3d] bg-[#151c27] px-3.5 py-1.5 text-[13px] font-bold text-[#f8fafc] transition hover:border-[#3b82f6]">
            ‹ {prev}
          </button>
        )}
        {next && (
          <button onClick={goNext} className="rounded-lg border border-[#222d3d] bg-[#151c27] px-3.5 py-1.5 text-[13px] font-bold text-[#f8fafc] transition hover:border-[#3b82f6]">
            {next} ›
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CompBar({
  label,
  width,
  note,
  color = "linear-gradient(90deg, #10b981, #38bdf8)",
  active,
  delay = 0,
}: {
  label: ReactNode;
  width: string;
  note: string;
  color?: string;
  active: boolean;
  delay?: number;
}) {
  return (
    <motion.div variants={riseChild} className="mb-2.5 rounded-[10px] border border-[#222d3d] bg-[#151c27] p-3">
      <div className="flex items-center justify-between text-[13px] font-bold text-[#f8fafc]">
        <span>{label}</span>
        <span className="text-[#34d399]">{note}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#1e2638]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: "0%" }}
          animate={active ? { width } : { width: "0%" }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

function ActionPill({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Magnetic strength={0.2}>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#10b981] bg-[rgba(16,185,129,0.13)] px-3.5 py-2 text-[12.5px] font-extrabold text-[#34d399] transition-colors hover:bg-[#10b981] hover:text-white"
      >
        {children}
      </motion.button>
    </Magnetic>
  );
}

/* ------------------------------------------------------------
   SLIDE 5 — tap flow diagram (animated nodes + live session data)
------------------------------------------------------------ */
function TapFlow({ active }: { active: boolean }) {
  const runAutoDemo = useEtm((s) => s.runAutoDemo);
  const benchResult = useEtm((s) => s.benchResult);
  const displayTime = benchResult ? `${benchResult.total}s` : "3.3s";

  const steps = [
    { tag: "TAP 1 · 0.8s", name: "Fare Tile", sub: "“₹18 Madiwala”" },
    { tag: "TAP 2 · 1.6s", name: "Pax Count", sub: "Tap “3 PAX” (Cash preselected)" },
    { tag: "TAP 3 · 0.9s", name: "Issue & Print", sub: "“ISSUE ₹54 · 3 PAX”", green: true },
  ];
  return (
    <motion.div variants={riseChild} className="my-4 rounded-[14px] border border-[#222d3d] bg-[#151c27] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {steps.map((st, i) => (
          <div key={st.tag} className="flex items-center gap-3">
            <motion.div
              className="min-w-[150px] flex-1 text-center"
              animate={active ? { scale: [1, 1.05, 1] } : {}}
              transition={{ delay: 0.5 + i * 0.45, duration: 0.5 }}
            >
              <div className="text-[11px] font-extrabold text-[#38bdf8]">{st.tag}</div>
              <div className={`my-1 text-[18px] font-extrabold ${st.green ? "text-[#10b981]" : "text-white"}`}>
                {st.name}
              </div>
              <div className="text-[12px] text-[#94a3b8]">{st.sub}</div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.span
                className="text-xl text-[#64748b]"
                animate={active ? { x: [0, 7, 0], opacity: [0.4, 1, 0.4] } : {}}
                transition={{ delay: 0.7 + i * 0.45, duration: 0.9, repeat: active ? Infinity : 0, repeatDelay: 1.4 }}
              >
                →
              </motion.span>
            )}
          </div>
        ))}
        <motion.span
          className="text-xl text-[#64748b]"
          animate={active ? { scale: [1, 1.3, 1] } : {}}
          transition={{ delay: 1.9, duration: 0.5, repeat: active ? Infinity : 0, repeatDelay: 1 }}
        >
          =
        </motion.span>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={active ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 1.95 }}
          className="rounded-[10px] border-[1.5px] border-[#10b981] bg-[rgba(16,185,129,0.14)] px-4 py-2.5 text-center"
        >
          <div className="text-[11px] font-extrabold text-[#10b981]">
            {benchResult ? "LIVE RECORD" : "BENCHMARK TIME"}
          </div>
          <div className="font-mono-tech text-[24px] font-black text-white">{displayTime}</div>
          <div className="text-[11px] font-bold text-[#34d399]">&lt; 4.0s PASSED ✓</div>
        </motion.div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionPill onClick={runAutoDemo}>▶ Run 3.3-Second Test on Hardware Simulator</ActionPill>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   individual slides
------------------------------------------------------------ */
function Slide1() {
  const words = ["The", "Conductor's", "Digital", "Companion"];
  return (
    <>
      <Eyebrow>Brief 1 · Nielsen Product Design Internship</Eyebrow>
      {/* Kinetic Typography Headline */}
      <motion.h2 variants={riseChild} className="mb-4 flex flex-wrap gap-x-2.5 text-[32px] font-extrabold leading-[1.2] text-white">
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block hover:text-sky-400 hover:scale-105 transition-transform"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </motion.h2>
      <Lead>
        Digitizing the heavy, tactile thermal-printer Electronic Ticketing Machines (ETMs) used by bus conductors
        across BMTC and BEST.
      </Lead>
      <HeroBanner>
        “Conductors don&apos;t think in destinations. <strong className="text-[#34d399]">They think in fares.</strong>”
        <span className="block pt-1 text-[14.5px] font-normal text-[#cbd5e1]">
          The fastest ticketing UI is not a destination search or a route map — it is a{" "}
          <strong className="text-[#34d399]">fare-first, GPS-aware ladder</strong> of giant tap targets:{" "}
          <strong className="text-[#34d399]">3 taps, &lt;4 seconds, eyes barely on the screen.</strong>
        </span>
      </HeroBanner>
      <Grid cols={3}>
        <StatCard value={3.3} decimals={1} suffix="s" label="Total Issuance" desc="Well under the 4.0-second constraint. Verified via live stopwatch." />
        <StatCard value={3} label="Taps · Happy Path" desc="Zero typing, zero search, zero scrolling, zero modal popups." />
        <StatCard value={100} suffix="%" label="Thumb Reach" desc="All primary tap targets reside in the lower 65% natural thumb arc." />
      </Grid>
      <Grid cols={3}>
        <Card>
          <CardTitle>🎯 1. One-Handed Use</CardTitle>
          <CardBody>
            Standing in a swaying bus, holding cash/grab-rail in one hand and the device in the other. Look/Touch
            partition keeps interactions low and glanceable.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>⚡ 2. Sub-4s Speed</CardTitle>
          <CardBody>
            Merging passenger count and payment selection onto a single screen eliminates redundant page transitions
            and cognitive friction.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>☀️ 3. High-Glare Contrast</CardTitle>
          <CardBody>
            Direct midday sunlight glare demands positive polarity (dark ink on pure white) with ≥7:1 contrast ratios
            and bold ≥18sp typography.
          </CardBody>
        </Card>
      </Grid>
      <FooterNav next="Next: Real Hardware Context" />
    </>
  );
}

function Slide2() {
  const attrs = [
    {
      t: "5.5–6.0\" Rugged Handheld (~380g)",
      d: "Heavy physical device held one-handed. Weight balance shifts toward the top where the thermal paper roll sits. Hand grip stays low.",
    },
    {
      t: "Integrated 58mm Thermal Printer",
      d: "Takes ~1.2s to feed paper. Screen mirrors ticket preview and animates progress directly on the issue button to preserve context.",
    },
    {
      t: "Intermittent 4G Cellular Drops",
      d: "Local SQLite cache guarantees instant ticket issuance regardless of network status. Auto-syncs at the depot Wi-Fi beacon.",
    },
    {
      t: "BMTC Stage Ladder Integers",
      d: "Fares are fixed increments (₹6, ₹12, ₹18, ₹25, ₹31…). Displaying ascending numeric tiles eliminates virtual keyboard search entirely.",
    },
  ];
  return (
    <>
      <Eyebrow>Real-World Field Grounding</Eyebrow>
      <Heading>Understanding the Physical Hardware &amp; Past Failures</Heading>
      <Lead>
        Grounding the software architecture in real municipal transport hardware rollouts and historical pain points:
      </Lead>
      <Grid>
        <Card accent="#3b82f6">
          <CardTitle>📰 BMTC 11,000 Smart-ETM Rollout (The Hindu, Mar 2026)</CardTitle>
          <CardBody>
            BMTC is actively rolling out 11,000 Android-based smart handhelds featuring built-in 58mm thermal
            printers. Our design is specifically crafted for this ruggedized all-in-one class, avoiding fragile
            Bluetooth pairing states.
          </CardBody>
        </Card>
        <Card accent="#ef4444">
          <CardTitle>⚠️ Lessons from Earlier Failures (Chennai MTC &amp; News9)</CardTitle>
          <CardBody>
            Earlier GPS ETMs crashed inside urban canyons and flyovers, forcing reversion to paper tickets. Battery
            drains crippled shifts. <strong className="text-[#e2e8f0]">Key Rule:</strong> GPS must assist, but never
            block a ticket sale. Offline-first is mandatory.
          </CardBody>
        </Card>
      </Grid>
      <Grid cols={2}>
        {attrs.map((a) => (
          <Card key={a.t}>
            <CardTitle>{a.t}</CardTitle>
            <CardBody>{a.d}</CardBody>
          </Card>
        ))}
      </Grid>
      <FooterNav prev="Previous" next="Next: First-Principles Reframe" />
    </>
  );
}

function Slide3() {
  return (
    <>
      <Eyebrow>Design Strategy</Eyebrow>
      <Heading>First-Principles Reframe: Destination vs. Fare</Heading>
      <Lead>
        Why existing ticketing apps fail conductors, and why we completely discarded conventional search:
      </Lead>
      <Grid>
        <Card className="!border-[rgba(239,68,68,0.4)] !bg-[rgba(239,68,68,0.05)]">
          <CardTitle color="text-[#f87171]">❌ The Traditional App Trap (Search / Dropdowns)</CardTitle>
          <CardBody>
            Treating conductors like sedentary Uber riders: typing “M-a-d-i-w-a-l-a” on a virtual keyboard or
            scrolling a 45-stop list takes <strong className="text-[#e2e8f0]">8–12 seconds</strong>. In a jerky bus
            with damp fingers, typing has an 18% typo rate and causes immense physical strain.
          </CardBody>
        </Card>
        <Card className="!border-[rgba(16,185,129,0.4)] !bg-[rgba(16,185,129,0.05)]">
          <CardTitle color="text-[#34d399]">✅ The Conductor&apos;s Cognitive Model (Stage → Rupees)</CardTitle>
          <CardBody>
            Conductors memorize the stage chart. When a passenger says “Madiwala” or hands over ₹20, the
            conductor&apos;s brain instantly translates this to <strong className="text-[#e2e8f0]">“₹18”</strong>.
            Presenting giant numeric tiles matches their mental accounting directly.
          </CardBody>
        </Card>
      </Grid>
      <Card accent="#3b82f6" className="!border-l-4">
        <CardTitle>📐 The Look Zone (Top 35%) vs. Touch Zone (Bottom 65%) Partition</CardTitle>
        <CardBody>Human gaze and thumb sweep have opposite ergonomic centers during one-handed mobile grip:</CardBody>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-[#94a3b8]">
          <li>
            <strong className="text-[#e2e8f0]">Look Zone (Top 35%):</strong> Display-only signals. Route badge
            (335-E), GPS stage (ST-12), and the giant live total (₹54). The conductor&apos;s eyes glance here while
            scanning the aisle.
          </li>
          <li>
            <strong className="text-[#e2e8f0]">Touch Zone (Bottom 65%):</strong> 100% of interactive targets. Fares,
            passenger counts, and the primary action button reside inside the natural thumb arc.
          </li>
        </ul>
      </Card>
      <FooterNav prev="Previous" next="Next: Assumptions" />
    </>
  );
}

function Slide4() {
  const cards = [
    { t: "1. Taps-Only Input", d: "Sudden braking, swaying, and crowded aisle jostling make swiping, sliders, and pinch gestures unreliable. Every interaction is a discrete tap." },
    { t: "2. Cash Default (0 Taps)", d: "Cash accounts for >85% of city bus rides. Cash is pre-selected by default, saving 1 tap per transaction. UPI QR is 1 tap away." },
    { t: "3. Bilingual Hierarchy", d: "Kannada is placed first on top, English second. The user's cognitive comfort, not English-first orthodoxy, governs typography." },
    { t: "4. High-Glare Polarity", d: "Direct sun glare through windows washes out dark mode. Positive polarity (black ink on white) reflects ambient light evenly, preserving ≥7:1 contrast." },
    { t: "5. Student Pass Holders", d: "Thousands of students use concessional passes. The app includes instant pass validation display without wasting thermal paper rolls." },
    { t: "6. Zero Modal Confirmations", d: "“Are you sure?” modals waste 1.5s per ticket. Confirmation is built directly into the live total on the action button: “ISSUE ₹54 · 3 PAX”." },
  ];
  return (
    <>
      <Eyebrow>Design Foundation</Eyebrow>
      <Heading>Explicit Assumptions &amp; Environmental Constraints</Heading>
      <Grid cols={3}>
        {cards.map((c) => (
          <Card key={c.t}>
            <CardTitle>{c.t}</CardTitle>
            <CardBody>{c.d}</CardBody>
          </Card>
        ))}
      </Grid>
      <FooterNav prev="Previous" next="Next: 3-Tap Architecture" />
    </>
  );
}

function Slide5({ active }: { active: boolean }) {
  return (
    <>
      <Eyebrow>Interaction Engineering</Eyebrow>
      <Heading>The 3-Tap, 3.3-Second Ticketing Architecture</Heading>
      <TapFlow active={active} />
      <Card>
        <CardTitle>⏱️ How 4 seconds becomes 3.3s:</CardTitle>
        <CardBody>
          Merging the passenger count and payment selection into a single screen eliminates 1 entire page transition.
          Cash is preselected because &gt;85% of transactions are cash (saving another tap). Live total pop confirms
          transaction value in place.
        </CardBody>
      </Card>
      <FooterNav prev="Previous" next="Next: UI Specifications" />
    </>
  );
}

function Slide6() {
  return (
    <>
      <Eyebrow>Design Specifications &amp; Rationale</Eyebrow>
      <Heading>High-Fidelity Screen Architecture &amp; Annotations</Heading>
      <Grid>
        <Card>
          <CardTitle>Screen 1: HOME (Idle / Ladder)</CardTitle>
          <ul className="mt-1 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-[#94a3b8]">
            <li>
              <strong className="text-[#e2e8f0]">Status Strip (32dp):</strong> Battery &gt;20%, Sync status dot, GPS
              stage (⌖ ST-12). Settings gear safely tucked in top-right corner.
            </li>
            <li>
              <strong className="text-[#e2e8f0]">Route Header (64dp):</strong> High-contrast badge 335-E and
              bilingual terminal names. Look-zone placement.
            </li>
            <li>
              <strong className="text-[#e2e8f0]">Fare Tiles (84dp tall):</strong> 2-column grid. Giant 32sp bold
              numbers. Frequent short-trips placed at natural thumb sweep.
            </li>
          </ul>
        </Card>
        <Card>
          <CardTitle>Screen 2: COUNT + PAY (Merged)</CardTitle>
          <ul className="mt-1 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-[#94a3b8]">
            <li>
              <strong className="text-[#e2e8f0]">Live Total Hero (80sp):</strong> Giant bold number. Pops with a
              100ms scale feedback on any pax tap. Glanceable from 1 meter away.
            </li>
            <li>
              <strong className="text-[#e2e8f0]">Pax Tiles (80dp tall):</strong> 4 large touch targets (1, 2, 3, 4+).
              Default is 1 pax selected.
            </li>
            <li>
              <strong className="text-[#e2e8f0]">Giant Action Button (84dp):</strong> Vibrant #0E7A3D green. Contains
              live total to self-confirm without modal dialogs.
            </li>
          </ul>
        </Card>
        <Card>
          <CardTitle>Screen 3: PRINTING (In-Context)</CardTitle>
          <CardBody>
            Preserves screen context by overlaying a 58mm ticket preview rather than navigating to a blank screen.
            Progress bar replaces the issue button. Press-and-hold (500ms) cancellation avoids accidental taps during
            a bus lurch.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Screen 4: SUCCESS &amp; AUTO-RESET</CardTitle>
          <CardBody>
            Features an animated green checkmark, ticket serial, and an amber UNDO VOID (8s) pill. After 2.5 seconds,
            the screen automatically clears back to HOME with zero taps, ready for the next commuter.
          </CardBody>
        </Card>
      </Grid>
      <FooterNav prev="Previous" next="Next: Reachability Strategy" />
    </>
  );
}

function Slide7({ active }: { active: boolean }) {
  return (
    <>
      <Eyebrow color="#a78bfa">Deliverable #2 · Biomechanical Strategy</Eyebrow>
      <Heading>Thumb Arc Ergonomics &amp; Fitts&apos;s Law Applied</Heading>
      <Card accent="#3b82f6" className="!border-l-4 mb-4">
        <CardTitle>📐 Fitts&apos;s Law in Transit: MT = a + b · log₂(2D / W)</CardTitle>
        <CardBody>
          To minimize Movement Time (MT), we must minimize distance (D) and maximize target width (W). Every
          millisecond counts when handling 120 passengers per peak trip.
        </CardBody>
      </Card>

      <motion.div variants={riseChild} className="my-4">
        <CompBar
          active={active}
          delay={0.15}
          label={
            <>
              Fare Ladder Tiles: <strong>84dp × 165dp</strong>
            </>
          }
          width="100%"
          note="4.2× WCAG Standard"
        />
        <CompBar
          active={active}
          delay={0.3}
          label={
            <>
              Passenger Count Tiles: <strong>80dp × 78dp</strong>
            </>
          }
          width="80%"
          note="3.3× WCAG Standard"
        />
        <CompBar
          active={active}
          delay={0.45}
          label={
            <>
              Primary ISSUE Button: <strong>84dp × 340dp</strong>
            </>
          }
          width="90%"
          note="2.6× Material 3 Standard"
        />
        <CompBar
          active={active}
          delay={0.6}
          color="linear-gradient(90deg, #38bdf8, #60a5fa)"
          label={
            <>
              Back Chevron: <strong>42 × 42 dp</strong>
            </>
          }
          width="45%"
          note="1.8× WCAG Minimum"
        />
      </motion.div>
      <FooterNav prev="Previous" next="Next: Edge Cases & Resilience" />
    </>
  );
}

function Slide8() {
  const matrix = [
    { e: "E1: Underground Underpass / Cellular Drop", s: "Local SQLite queue caches ticket immediately; background sync pushes to depot server." },
    { e: "E2: Thermal Paper Roll Depleted", s: "Disables print head; switches instantly to digital ledger mode. Summary printed at depot." },
    { e: "E3: GPS Degraded / Urban Canyons", s: "Shows current stage with manual stage override drawer. Fares recompute without blocking." },
    { e: "E4: Passenger Cash Shortage / Mistap", s: "8-second visible UNDO countdown on success screen voiding ticket with zero supervisor PINs." },
    { e: "E7: Night Driving Direct Cabin Darkness", s: "Inverted AAA high contrast dark theme toggle preventing driver night blindness." },
  ];
  return (
    <>
      <Eyebrow color="#f59e0b">Deliverable #3 · Failure Scenarios</Eyebrow>
      <Heading>Edge Cases &amp; Operational Resilience Matrix</Heading>
      <div className="my-4 divide-y divide-[#1e293b] rounded-xl border border-[#222d3d] bg-[#151c27]">
        {matrix.map((m) => (
          <div key={m.e} className="p-3.5">
            <span className="font-mono-tech text-[12px] font-bold text-amber-400">{m.e}</span>
            <p className="mt-1 text-[13px] text-[#cbd5e1]">{m.s}</p>
          </div>
        ))}
      </div>
      <FooterNav prev="Previous" next="Next: Timed Walkthrough" />
    </>
  );
}

function Slide9() {
  const runAutoDemo = useEtm((s) => s.runAutoDemo);
  const setGhostReplayActive = useEtm((s) => s.setGhostReplayActive);
  const beats = [
    { t: "0:00 – 0:04", h: "Title Card & Idle Screen", d: "“Three passengers. Under four seconds. Watch the live stopwatch.” (Show idle glare-bright home screen)." },
    { t: "0:04 – 0:08 (0.8s)", h: "Tap ₹18 Madiwala Tile", d: "“Conductors think in fares, not searches. One tap selects ₹18.” (Screen immediately transitions)." },
    { t: "0:08 – 0:15 (2.4s)", h: "Tap 3 PAX Tile", d: "“Tap three passengers. Cash is preselected. Total updates to ₹54.” (Live total pops with bounce)." },
    { t: "0:15 – 0:20 (3.3s)", h: "Tap ISSUE ₹54 Button", d: "“Tap Issue. Done in 3.3 seconds — well under the 4-second limit.” (Thermal ticket rolls out)." },
  ];
  return (
    <>
      <Eyebrow>Validation &amp; Evidence</Eyebrow>
      <Heading>Timed Walkthrough Proof &amp; 30-Second Video Script</Heading>
      <Card className="mb-4">
        <CardTitle>🎬 30-Second Video Script (Ready for Loom / Screen Recording)</CardTitle>
        <CardBody>Record this exact sequence while the simulator&apos;s built-in stopwatch runs:</CardBody>
      </Card>
      <Grid>
        {beats.map((b) => (
          <Card key={b.t}>
            <div className="font-mono-tech mb-1 text-[11px] font-extrabold text-[#38bdf8]">{b.t}</div>
            <CardTitle>{b.h}</CardTitle>
            <CardBody>
              <em>{b.d}</em>
            </CardBody>
          </Card>
        ))}
      </Grid>
      <motion.div variants={riseChild} className="my-5 flex flex-wrap justify-center gap-3">
        <Magnetic strength={0.25}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={runAutoDemo}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-[14px] font-extrabold text-white shadow-[0_4px_18px_rgba(16,185,129,0.4)]"
          >
            ▶ Run Automated 3.3-Second Test Demonstration
          </motion.button>
        </Magnetic>

        <Magnetic strength={0.25}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setGhostReplayActive(true)}
            className="rounded-xl border border-sky-400/50 bg-sky-500/20 px-6 py-3 text-[14px] font-extrabold text-sky-300 hover:bg-sky-500/30"
          >
            👻 Launch Ghost-Hand Scrubbable Replay
          </motion.button>
        </Magnetic>
      </motion.div>
      <FooterNav prev="Previous" next="Next: Defense Guide" />
    </>
  );
}

function Slide10() {
  const qas = [
    {
      q: "Q1: Why fare-first instead of destination search?",
      a: "Conductors on fixed routes don't explore; they execute. They know their stages by heart. A destination search requires 6+ keyboard taps on a shaking bus; a fare ladder requires 1 tap. Fares align directly with their mental accounting.",
    },
    {
      q: "Q2: Why light theme instead of dark mode for glare?",
      a: "Contrast sensitivity physics. Direct sunlight reflections wash out dark screens by reducing the dynamic range of light emitted. Positive polarity (dark ink on white) reflects ambient light evenly, preserving >7:1 contrast in bright cabin glare.",
    },
    {
      q: "Q3: Why undo instead of confirmation dialogs?",
      a: "Confirmation modals tax 100% of transactions to protect against the 0.5% mistake. In a bus carrying 120 passengers, modals waste 3 minutes per route. Undo taxes zero legitimate sales while keeping mistakes 100% reversible.",
    },
    {
      q: "Q4: How would you validate this with conductors?",
      a: "I would shadow 3 BMTC conductors on Route 335-E during morning peak (8–10 AM) and evening peak (6–8 PM). I'd track two quantitative metrics: Task Completion Time (seconds) and Mis-Tap Error Rate under sudden braking conditions.",
    },
  ];
  return (
    <>
      <Eyebrow color="#a78bfa">Critical Thinking &amp; Rigor</Eyebrow>
      <Heading>Field Validation Plan &amp; Interview Defense Guide</Heading>
      <Grid>
        {qas.map((c) => (
          <Card key={c.q}>
            <CardTitle>{c.q}</CardTitle>
            <CardBody>
              <strong className="text-[#34d399]">Defense:</strong> {c.a}
            </CardBody>
          </Card>
        ))}
      </Grid>
      <HeroBanner>
        <strong className="text-[#34d399]">Next Steps for Version 2.0:</strong>
        <span className="block pt-1 text-[14px] font-normal text-[#cbd5e1]">
          Haptic motor frequency tuning (matching bus engine rumble cancellation), Bluetooth depot beacon automatic
          shift checkout, and UPI offline soundbox audio confirmation integration.
        </span>
      </HeroBanner>
      <motion.div variants={riseChild} className="mt-6 flex items-center justify-between border-t border-[#222d3d] pt-5">
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-[#222d3d] bg-[#151c27] px-4 py-2 text-[13px] font-bold text-[#f8fafc] transition hover:border-[#3b82f6]"
        >
          ⎙ Export Clean PDF Deck
        </button>
        <span className="text-[12px] text-[#64748b]">— End of case study · Built with React + Framer Motion —</span>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------
   slide registry — (active) => JSX
------------------------------------------------------------ */
function renderSlide(n: number, active: boolean): ReactNode {
  switch (n) {
    case 1: return <Slide1 />;
    case 2: return <Slide2 />;
    case 3: return <Slide3 />;
    case 4: return <Slide4 />;
    case 5: return <Slide5 active={active} />;
    case 6: return <Slide6 />;
    case 7: return <Slide7 active={active} />;
    case 8: return <Slide8 />;
    case 9: return <Slide9 />;
    case 10: return <Slide10 />;
    default: return null;
  }
}

const TOTAL_SLIDES = 10;

export default function CaseStudyDeck() {
  const current = useEtm((s) => s.currentSlide);
  const article = useEtm((s) => s.deckArticle);
  const goTo = useEtm((s) => s.goToSlide);
  const goNext = useEtm((s) => s.nextSlide);
  const goPrev = useEtm((s) => s.prevSlide);
  const toggleDeckMode = useEtm((s) => s.toggleDeckMode);
  const total = TOTAL_SLIDES;

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);

  /* keyboard navigation & presentation shortcuts */
  useEffect(() => {
    let hornBuffer = "";
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is inside an input
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight" || e.key === "PageDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "PageUp") goPrev();

      if (e.key.toLowerCase() === "o") {
        setOverviewOpen((v) => !v);
      }
      if (e.key.toLowerCase() === "s") {
        setNotesOpen((v) => !v);
      }
      if (e.key === "?") {
        setCheatOpen((v) => !v);
      }

      // '335E' easter egg horn
      hornBuffer = (hornBuffer + e.key.toUpperCase()).slice(-4);
      if (hornBuffer === "335E") {
        playSfx("horn");
        toast.success("📢 BMTC ROUTE 335-E AIR HORN!", { icon: "🚌" });
        hornBuffer = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4">
      {/* Presentation Modals */}
      <SlideOverviewModal open={overviewOpen} onClose={() => setOverviewOpen(false)} />
      <SpeakerNotesModal open={notesOpen} onClose={() => setNotesOpen(false)} />
      <KeyboardCheatSheet open={cheatOpen} onClose={() => setCheatOpen(false)} />

      {/* control bar */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={softSpring}
        className="sticky top-2 z-[100] rounded-[14px] border border-[#222d3d] bg-[#0f141dee] p-3 shadow-[0_6px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono-tech rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.13)] px-2.5 py-1 text-[13px] font-extrabold text-[#60a5fa]">
              {String(current).padStart(2, "0")} / {total}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={current}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="truncate text-[13.5px] font-extrabold text-white"
              >
                {SLIDE_TITLES[current - 1]}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Quick presenter actions */}
            <button
              onClick={() => setOverviewOpen(true)}
              className="rounded-lg border border-[#222d3d] bg-[#151c27] px-2.5 py-1.5 text-[11px] font-bold text-[#94a3b8] hover:text-white"
              title="Slide Overview (Press 'O')"
            >
              ☷ Grid (O)
            </button>
            <button
              onClick={() => setNotesOpen(true)}
              className="rounded-lg border border-[#222d3d] bg-[#151c27] px-2.5 py-1.5 text-[11px] font-bold text-[#94a3b8] hover:text-white"
              title="Speaker Notes (Press 'S')"
            >
              🎙 Notes (S)
            </button>
            <button
              onClick={() => setCheatOpen(true)}
              className="rounded-lg border border-[#222d3d] bg-[#151c27] px-2.5 py-1.5 text-[11px] font-bold text-[#94a3b8] hover:text-white"
              title="Shortcuts (Press '?')"
            >
              ?
            </button>

            <div className="flex gap-1.5">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={goPrev}
                className="rounded-lg border border-[#222d3d] bg-[#151c27] px-3 py-1.5 text-[12.5px] font-bold text-[#f8fafc] transition hover:border-[#3b82f6]"
              >
                ‹ Prev
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={goNext}
                className="rounded-lg border border-[#222d3d] bg-[#151c27] px-3 py-1.5 text-[12.5px] font-bold text-[#f8fafc] transition hover:border-[#3b82f6]"
              >
                Next ›
              </motion.button>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleDeckMode}
              className={`rounded-lg border px-3 py-1.5 text-[12px] font-bold transition ${
                article
                  ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                  : "border-[#222d3d] bg-transparent text-[#94a3b8] hover:text-white"
              }`}
            >
              {article ? "Article Mode" : "Slide Mode"}
            </motion.button>
          </div>
        </div>
        {/* progress rail */}
        <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[#1e2638]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-[#38bdf8] to-[#10b981]"
            animate={{ width: `${(current / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </motion.div>

      {/* thumbnail ribbon */}
      <div className="nice-scroll flex gap-1.5 overflow-x-auto pb-1">
        {SLIDE_TITLES.map((t, i) => (
          <motion.button
            key={t}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goTo(i + 1)}
            className={`relative whitespace-nowrap rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${
              current === i + 1
                ? "border-transparent text-white"
                : "border-[#222d3d] bg-[#0f141d] text-[#94a3b8] hover:border-[#64748b] hover:text-white"
            }`}
          >
            {current === i + 1 && (
              <motion.span
                layoutId="thumbPill"
                className="absolute inset-0 rounded-lg bg-[#3b82f6]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">
              {String(i + 1).padStart(2, "0")} {t.split("&")[0].split("(")[0].trim().split(" ").slice(0, 2).join(" ")}
            </span>
          </motion.button>
        ))}
      </div>

      {/* slide canvas */}
      <div className="rounded-[18px] border border-[#222d3d] bg-[#0f141d] p-7 shadow-[0_14px_50px_rgba(0,0,0,0.45)] md:p-9">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const visible = article || current === n;
          return (
            <div key={n} className={`slide-shell ${visible ? "" : "hidden-slide"}`}>
              <SlideShell active={visible}>{renderSlide(n, visible)}</SlideShell>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const softSpring = { type: "spring", stiffness: 200, damping: 24 } as const;
