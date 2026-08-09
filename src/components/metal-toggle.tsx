"use client";

interface MetalToggleProps<T extends string> {
  options: { key: T; label: React.ReactNode }[];
  value: T;
  onChange: (key: T) => void;
  optionWidth?: number;
}

/** Toggle pill kim loại với indicator trượt (port từ view-mode-toggle, tổng quát N lựa chọn). */
export function MetalToggle<T extends string>({ options, value, onChange, optionWidth = 96 }: MetalToggleProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  return (
    <div
      className="relative inline-flex gap-1 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-900 p-1 shadow-lg"
      style={{ width: `${options.length * optionWidth + (options.length - 1) * 4 + 8}px` }}
    >
      <div
        className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${optionWidth}px`,
          background: "linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 50%, #4a4a4a 100%)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          transform: `translateX(${index * (optionWidth + 4)}px)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className="relative z-10 flex h-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-200"
          style={{ width: `${optionWidth}px`, color: o.key === value ? "#1a1a1a" : "#8a8a8a" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
