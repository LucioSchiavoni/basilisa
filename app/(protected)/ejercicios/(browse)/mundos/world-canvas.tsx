"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  angle: number;
  angleSpeed: number;
  phase: number;
  flipAngle: number;
  color: string;
}

const LEAF_COLORS = ["#4ade80", "#22c55e", "#86efac", "#fde68a", "#fcd34d"];
const SPARK_COLORS = ["#fef08a", "#fb923c", "#ef4444", "#fbbf24"];

function spawnParticle(world: string, canvas: HTMLCanvasElement, randomY = true): Particle {
  const { width, height } = canvas;
  switch (world) {
    case "medieval":
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 20,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.25 + 0.08),
        opacity: Math.random() * 0.25 + 0.10,
        size: Math.random() * 2 + 1.5,
        angle: 0,
        angleSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        flipAngle: 0,
        color: "",
      };
    case "agua":
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 20,
        vx: 0,
        vy: -(Math.random() * 0.5 + 0.2),
        opacity: Math.random() * 0.35 + 0.15,
        size: Math.random() * 10 + 5,
        angle: 0, angleSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        flipAngle: 0, color: "",
      };
    case "bosque":
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.6 + 0.3,
        opacity: Math.random() * 0.5 + 0.4,
        size: Math.random() * 6 + 5,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.03,
        phase: Math.random() * Math.PI * 2,
        flipAngle: 0,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      };
    case "hielo":
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 5 + 4,
        angle: Math.random() * Math.PI,
        angleSpeed: (Math.random() - 0.5) * 0.01,
        phase: 0, flipAngle: 0, color: "",
      };
    case "fuego":
      return {
        x: width * 0.25 + Math.random() * width * 0.5,
        y: randomY ? Math.random() * height : height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 2 + 1),
        opacity: Math.random() * 0.7 + 0.3,
        size: Math.random() * 3 + 2,
        angle: 0, angleSpeed: 0, phase: 0, flipAngle: 0,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      };
    case "cielo":
      return {
        x: randomY ? Math.random() * width : -(Math.random() * 60 + 120),
        y: Math.random() * height * 0.7 + height * 0.05,
        vx: Math.random() * 0.3 + 0.1,
        vy: 0,
        opacity: Math.random() * 0.3 + 0.12,
        size: Math.random() * 22 + 14,
        angle: 0, angleSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        flipAngle: 0, color: "",
      };
    default:
      return { x: 0, y: 0, vx: 0, vy: 0, opacity: 0, size: 0, angle: 0, angleSpeed: 0, phase: 0, flipAngle: 0, color: "" };
  }
}

function updateParticle(world: string, p: Particle, canvas: HTMLCanvasElement): void {
  const { width, height } = canvas;
  p.x += p.vx;
  p.y += p.vy;
  switch (world) {
    case "medieval":
      p.phase += 0.014;
      p.x += Math.sin(p.phase * 0.7) * 0.18;
      if (p.y + p.size * 3 < 0) Object.assign(p, spawnParticle("medieval", canvas, false));
      break;
    case "agua":
      p.phase += 0.02;
      p.x += Math.sin(p.phase) * 0.35;
      if (p.y + p.size < 0) Object.assign(p, spawnParticle("agua", canvas, false));
      break;
    case "bosque":
      p.angle += p.angleSpeed;
      p.phase += 0.015;
      p.vx += Math.sin(p.phase) * 0.01;
      if (p.y - p.size > height) Object.assign(p, spawnParticle("bosque", canvas, false));
      if (p.x < -p.size * 2) p.x = width + p.size;
      if (p.x > width + p.size * 2) p.x = -p.size;
      break;
    case "hielo":
      p.angle += p.angleSpeed;
      p.phase += 0.01;
      p.vx += Math.sin(p.phase) * 0.008;
      if (p.y - p.size > height) Object.assign(p, spawnParticle("hielo", canvas, false));
      break;
    case "fuego":
      p.opacity -= 0.008;
      p.size *= 0.995;
      if (p.opacity <= 0 || p.y + p.size < 0) Object.assign(p, spawnParticle("fuego", canvas, false));
      break;
    case "cielo":
      p.phase += 0.008;
      p.y += Math.sin(p.phase) * 0.12;
      if (p.x > width + p.size * 4) Object.assign(p, spawnParticle("cielo", canvas, false));
      break;
  }
}

function drawParticle(world: string, ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  switch (world) {
    case "medieval": {
      const pulse = 0.55 + Math.sin(p.phase) * 0.45;
      ctx.globalAlpha = p.opacity * pulse;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.6);
      g.addColorStop(0, "rgba(220, 190, 255, 1)");
      g.addColorStop(0.5, "rgba(192, 132, 252, 0.60)");
      g.addColorStop(1, "rgba(160, 90, 230, 0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      break;
    }
    case "agua": {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(186, 230, 253, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fill();
      break;
    }
    case "bosque": {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      break;
    }
    case "hielo": {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.strokeStyle = "rgba(186, 230, 253, 0.85)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, p.size);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      break;
    }
    case "fuego": {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
      g.addColorStop(0, "rgba(255, 255, 200, 0.95)");
      g.addColorStop(0.3, p.color + "cc");
      g.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      break;
    }
    case "cielo": {
      const s = p.size;
      const cx = p.x;
      const cy = p.y;
      const blobs = [
        { dx: 0,        dy: 0,        r: s        },
        { dx: -s * 0.7, dy: s * 0.18, r: s * 0.72 },
        { dx:  s * 0.7, dy: s * 0.18, r: s * 0.68 },
        { dx: -s * 0.32,dy: -s * 0.48,r: s * 0.58 },
        { dx:  s * 0.32,dy: -s * 0.52,r: s * 0.52 },
      ];

      ctx.save();
      ctx.globalAlpha = p.opacity * 0.28;
      ctx.fillStyle = "rgba(160, 210, 245, 1)";
      ctx.beginPath();
      for (const b of blobs) {
        ctx.arc(cx + b.dx, cy + b.dy + s * 0.28, b.r * 0.88, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.beginPath();
      for (const b of blobs) {
        ctx.arc(cx + b.dx, cy + b.dy, b.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
      break;
    }
  }
  ctx.restore();
}

const COUNTS: Record<string, number> = {
  medieval: 14,
  agua: 25,
  bosque: 20,
  hielo: 35,
  fuego: 30,
  cielo: 8,
};

export function WorldCanvas({ worldName, isActive }: { worldName: string; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    setVisible(false);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = COUNTS[worldName] ?? 20;
    const particles = Array.from({ length: count }, () =>
      spawnParticle(worldName, canvas, true)
    );

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        updateParticle(worldName, p, canvas);
        drawParticle(worldName, ctx, p);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      setVisible(true);
      rafRef.current = requestAnimationFrame(tick);
    }, 800);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [worldName, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-opacity duration-700"
      style={{ zIndex: -1, opacity: visible ? 1 : 0 }}
    />
  );
}
