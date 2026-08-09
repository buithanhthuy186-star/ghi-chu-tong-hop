"use client";
import { useEffect, useRef, useCallback } from "react";

const TEXTS = ["GEMADEPT", "THE WAY FORWARD", "GHI CHÚ TỔNG HỢP"];
const CYCLE_MS = 4000;

interface Vec2 { x: number; y: number }

class Particle {
  pos: Vec2 = { x: 0, y: 0 };
  vel: Vec2 = { x: 0, y: 0 };
  target: Vec2 = { x: 0, y: 0 };
  opacity = 0;

  move() {
    const dx = this.target.x - this.pos.x;
    const dy = this.target.y - this.pos.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    // Gentle spring: smooth pull with heavy damping
    const force = 0.015;
    this.vel.x += dx * force;
    this.vel.y += dy * force;
    this.vel.x *= 0.82;
    this.vel.y *= 0.82;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    // Fade in
    if (this.opacity < 1) this.opacity = Math.min(1, this.opacity + 0.03);
  }
}

export function ParticleText() {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const partsRef = useRef<Particle[]>([]);
  const wordRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const getTextPixels = useCallback((word: string, w: number, h: number): Vec2[] => {
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d")!;
    ctx.fillStyle = "black";
    const fontSize = Math.min(h * 0.9, (w / word.length) * 1.4);
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, w / 2, h / 2);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const coords: Vec2[] = [];
    const step = 2;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const alpha = d[(y * w + x) * 4 + 3];
        if (alpha > 40) coords.push({ x, y });
      }
    }
    return coords;
  }, []);

  const assignTargets = useCallback((targets: Vec2[], parts: Particle[], cw: number, ch: number) => {
    const shuffled = [...targets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Trim extra particles (noise outside text)
    if (parts.length > shuffled.length) {
      parts.splice(shuffled.length);
    }

    // Assign targets to existing particles
    for (let i = 0; i < parts.length; i++) {
      parts[i].target = shuffled[i];
      parts[i].opacity = 0; // fade in on new target
    }

    // Create new particles if needed
    for (let i = parts.length; i < shuffled.length; i++) {
      const p = new Particle();
      // Start near target to avoid long travel
      p.pos.x = shuffled[i].x + (Math.random() - 0.5) * 30;
      p.pos.y = shuffled[i].y + (Math.random() - 0.5) * 30;
      p.target = shuffled[i];
      parts.push(p);
    }
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;

    const resize = () => {
      const p = c.parentElement;
      if (!p) return;
      const dpr = window.devicePixelRatio || 1;
      const w = p.clientWidth;
      const h = p.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };

      const word = TEXTS[wordRef.current];
      const targets = getTextPixels(word, w, h);
      assignTargets(targets, partsRef.current, w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    // Text cycle
    const cycleTimer = setInterval(() => {
      wordRef.current = (wordRef.current + 1) % TEXTS.length;
      const { w, h } = sizeRef.current;
      const word = TEXTS[wordRef.current];
      const targets = getTextPixels(word, w, h);
      assignTargets(targets, partsRef.current, w, h);
    }, CYCLE_MS);

    // Animation loop
    const animate = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const parts = partsRef.current;
      for (const p of parts) {
        p.move();
        if (p.opacity < 0.02) continue; // skip invisible
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,10,10,${p.opacity.toFixed(2)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(cycleTimer);
      window.removeEventListener("resize", resize);
    };
  }, [getTextPixels, assignTargets]);

  return <canvas ref={ref} className="block h-full w-full" aria-hidden="true" />;
}