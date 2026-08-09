"use client";

import { motion } from "framer-motion";

interface GooeyTabsProps<T extends string> {
  items: { key: T; label: React.ReactNode }[];
  active: T;
  onChange: (key: T) => void;
  /** Id duy nhất cho SVG filter (tránh đụng khi có nhiều bộ tab trên trang). */
  filterId: string;
  size?: "sm" | "md";
}

/** Tab "gooey" kim loại (port từ bộ shader-button, tổng quát hoá N tab). */
export function GooeyTabs<T extends string>({ items, active, onChange, filterId, size = "md" }: GooeyTabsProps<T>) {
  const activeIndex = items.findIndex((i) => i.key === active);
  return (
    <div className="relative">
      <div className="flex justify-center" style={{ filter: `url(#${filterId})` }}>
        {items.map((item, index) => (
          <motion.button
            key={item.key}
            animate={{
              margin: activeIndex === index ? "0 20px" : "0",
              background:
                activeIndex === index
                  ? "linear-gradient(135deg, rgb(190,190,190) 0%, rgb(120,120,120) 50%, rgb(80,80,80) 100%)"
                  : "rgb(30,30,30)",
            }}
            transition={{
              background: { type: "spring", bounce: 0, duration: 0.3, delay: 0.1 },
              type: "spring",
              bounce: 0.2,
              duration: 1.2,
            }}
            className={`relative overflow-hidden font-semibold tracking-tight text-white focus:outline-none ${
              size === "md" ? "px-4 py-2 text-sm md:text-base" : "px-3 py-1.5 text-xs md:text-sm"
            }`}
            onClick={() => onChange(item.key)}
          >
            <span>{item.label}</span>
          </motion.button>
        ))}
      </div>
      <svg
        className="absolute -z-10"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style={{ width: 0, height: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur-sm" />
            <feColorMatrix
              in="blur-sm"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 36 -18"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
