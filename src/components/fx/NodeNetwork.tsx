"use client";

/* ============================================================
   NODE NETWORK — interactive canvas constellation
   Drifting nodes + proximity links + cursor gravity +
   data pulses traveling along active connections.
   ============================================================ */

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number; // 0 = blue, 1 = green, 2 = cyan
  hub: boolean;
  phase: number;
}

interface Pulse {
  a: number; // node index A
  b: number; // node index B
  t: number; // 0..1 progress
  speed: number;
  hue: string;
}

const NODE_COLORS = ["96,165,250", "52,211,153", "56,189,248"];

export default function NodeNetwork({ density = 26000 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const LINK_DIST = 135;
    const MOUSE_DIST = 190;
    let lastPulseSpawn = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const seed = () => {
      const count = Math.max(36, Math.min(110, Math.floor((W * H) / density)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() < 0.12 ? 2.6 + Math.random() * 1.6 : 1 + Math.random() * 1.3,
        hue: i % 9 === 0 ? 1 : i % 3 === 0 ? 2 : 0,
        hub: i % 11 === 0,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const spawnPulse = (time: number) => {
      if (time - lastPulseSpawn < 420 || nodes.length < 2) return;
      // find a pair that is currently linked
      for (let tries = 0; tries < 8; tries++) {
        const a = Math.floor(Math.random() * nodes.length);
        const b = Math.floor(Math.random() * nodes.length);
        if (a === b) continue;
        const dx = nodes[a].x - nodes[b].x;
        const dy = nodes[a].y - nodes[b].y;
        if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
          pulses.push({
            a,
            b,
            t: 0,
            speed: 0.012 + Math.random() * 0.02,
            hue: NODE_COLORS[nodes[a].hue],
          });
          lastPulseSpawn = time;
          break;
        }
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);

      /* --- update nodes --- */
      for (const n of nodes) {
        n.phase += 0.012;
        // gentle drift + sinusoidal float
        n.x += n.vx + Math.sin(n.phase) * 0.05;
        n.y += n.vy + Math.cos(n.phase * 0.8) * 0.05;

        // cursor gravity (soft attraction)
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_DIST * MOUSE_DIST && d2 > 40) {
            const d = Math.sqrt(d2);
            const f = ((MOUSE_DIST - d) / MOUSE_DIST) * 0.045;
            n.x += dx * f;
            n.y += dy * f;
          }
        }

        // wrap edges
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      }

      /* --- links --- */
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.34;
            const col = a.hue === 1 || b.hue === 1 ? NODE_COLORS[1] : NODE_COLORS[0];
            ctx.strokeStyle = `rgba(${col},${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      /* --- cursor links (brighter) --- */
      if (mouse.active) {
        for (const n of nodes) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_DIST) {
            const alpha = (1 - d / MOUSE_DIST) * 0.55;
            ctx.strokeStyle = `rgba(125,211,252,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }
        // cursor halo
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
        grad.addColorStop(0, "rgba(56,189,248,0.10)");
        grad.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      /* --- data pulses along links --- */
      spawnPulse(time);
      pulses = pulses.filter((p) => p.t <= 1);
      for (const p of pulses) {
        p.t += p.speed;
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(p.t * Math.PI);
        // trail
        const tailX = a.x + (b.x - a.x) * Math.max(0, p.t - 0.08);
        const tailY = a.y + (b.y - a.y) * Math.max(0, p.t - 0.08);
        ctx.strokeStyle = `rgba(${p.hue},${(0.5 * fade).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(${p.hue},${(0.9 * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      /* --- nodes on top --- */
      for (const n of nodes) {
        const twinkle = 0.65 + Math.sin(n.phase * 2.2) * 0.35;
        const col = NODE_COLORS[n.hue];
        if (n.hub) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          g.addColorStop(0, `rgba(${col},${(0.28 * twinkle).toFixed(3)})`);
          g.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${col},${(0.85 * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduced) {
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      draw(0); // single static render
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
