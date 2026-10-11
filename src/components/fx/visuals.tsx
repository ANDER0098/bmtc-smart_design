"use client";

/* ============================================================
   FX TOOLKIT
   Aurora · Magnetic · Tilt · AnimatedNumber · Confetti · variants
   ============================================================ */

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  animate,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from "react";

/* ------------------------------------------------------------
   Shared stagger variants (used by deck slides)
------------------------------------------------------------ */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
};

export const riseChild: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 130, damping: 19 },
  },
};

/* ------------------------------------------------------------
   AURORA BACKGROUND — slow drifting gradient orbs + grid
------------------------------------------------------------ */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 75% -10%, rgba(59,130,246,0.10), transparent 60%)," +
            "radial-gradient(900px 600px at 8% 108%, rgba(16,185,129,0.08), transparent 55%)," +
            "linear-gradient(180deg, #090c12 0%, #0b0f17 55%, #090c12 100%)",
        }}
      />
      {/* drifting orbs */}
      <div
        className="absolute -top-32 right-[8%] h-[480px] w-[480px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)",
          filter: "blur(46px)",
          animation: "aurora-drift-a 17s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-160px] left-[-100px] h-[520px] w-[520px] rounded-full opacity-55"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)",
          filter: "blur(52px)",
          animation: "aurora-drift-b 21s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/2 top-[34%] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 62%)",
          filter: "blur(58px)",
          animation: "aurora-drift-c 25s ease-in-out infinite",
        }}
      />
      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 78%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------
   MAGNETIC — element gently follows the cursor
------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.32,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------
   TILT — 3D perspective tilt with cursor glare
------------------------------------------------------------ */
export function Tilt({
  children,
  max = 7,
  glare = true,
  className = "",
  style,
}: {
  children: ReactNode;
  max?: number;
  glare?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.09), transparent 65%)`;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200, ...style }}
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------
   ANIMATED NUMBER — spring-driven rolling digits
------------------------------------------------------------ */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  duration = 0.9,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(`0${decimals ? "." + "0".repeat(decimals) : ""}`);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, duration, mv]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------
   CONFETTI BURST — canvas particles on ticket success
------------------------------------------------------------ */
interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  life: number;
  shape: number;
}

const CONFETTI_COLORS = ["#10b981", "#38bdf8", "#f59e0b", "#60a5fa", "#34d399", "#fbbf24"];

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<ConfettiParticle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const W = (canvas.width = rect.width);
    const H = (canvas.height = rect.height);
    const cx = W / 2;
    const cy = H * 0.32;

    partsRef.current = Array.from({ length: 130 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 3 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
        shape: Math.random() < 0.5 ? 0 : 1,
      };
    });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of partsRef.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.16; // gravity
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.011;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[70] h-full w-full"
    />
  );
}

/* ------------------------------------------------------------
   Section label chip (deck eyebrows with pulse dot)
------------------------------------------------------------ */
export function Eyebrow({ children, color = "#60a5fa" }: { children: ReactNode; color?: string }) {
  return (
    <motion.div variants={riseChild} className="mb-1.5 flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ background: color }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <span
        className="text-[12px] font-extrabold uppercase tracking-[0.14em]"
        style={{ color }}
      >
        {children}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   Slide shell — wraps every deck slide with 3D entrance
------------------------------------------------------------ */
export function SlideShell({
  active,
  children,
  ...rest
}: { active: boolean; children: ReactNode } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate={active ? "show" : "hidden"}
      style={{ transformPerspective: 1400 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
