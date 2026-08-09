"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Animate direct children with a stagger instead of the wrapper itself. */
  stagger?: boolean;
  y?: number;
  delay?: number;
  /** Re-run animation whenever this value changes (vd: list kết quả mới). */
  replayKey?: string | number;
};

/**
 * Fade-up reveal (port từ web chống thấm, bản không ScrollTrigger —
 * app 1 màn hình, animate ngay khi mount / khi replayKey đổi).
 * Respects prefers-reduced-motion.
 */
export function Reveal({ children, className, stagger = false, y = 24, delay = 0, replayKey }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = stagger ? el.children : el;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.08 : 0,
      });
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagger, y, delay, replayKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

type FloatProps = {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
};

/** Chuyển động lơ lửng nhẹ vô hạn (port từ web chống thấm). */
export function Float({ children, className, amplitude = 6, duration = 2.5 }: FloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.to(el, { y: amplitude, duration, ease: "sine.inOut", repeat: -1, yoyo: true });
    }, el);
    return () => ctx.revert();
  }, [amplitude, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
