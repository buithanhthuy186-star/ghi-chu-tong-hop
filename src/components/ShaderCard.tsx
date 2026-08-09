"use client";

import React, { useState, useRef, useEffect } from "react";

interface ShaderCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  width?: number;
  height?: number;
}

/** Card với viền shader kim loại lỏng (giống LiquidMetalButton nhưng dạng card to). */
export function ShaderCard({ children, onClick, width = 200, height = 130 }: ShaderCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const styleId = "shader-card-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-card-container canvas {
          width: 100% !important; height: 100% !important; display: block !important;
          position: absolute !important; top: 0 !important; left: 0 !important;
          border-radius: 16px !important;
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) shaderMount.current.destroy();
          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.3, u_shiftBlue: 0.3,
              u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1,
              u_offsetX: 0.1, u_offsetY: -0.1,
            },
            undefined,
            0.6,
          );
        }
      } catch (e) { console.error("ShaderCard load failed:", e); }
    };
    loadShader();
    return () => { shaderMount.current?.destroy?.(); shaderMount.current = null; };
  }, [width, height]);

  const handleMouseEnter = () => { setIsHovered(true); shaderMount.current?.setSpeed?.(1.2); };
  const handleMouseLeave = () => { setIsHovered(false); setIsPressed(false); shaderMount.current?.setSpeed?.(0.6); };
  const handleClick = (e: React.MouseEvent) => {
    if (shaderMount.current) { shaderMount.current.setSpeed?.(2.4); setTimeout(() => shaderMount.current?.setSpeed?.(isHovered ? 1.2 : 0.6), 300); }
    onClick?.();
  };

  const spring = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease";

  return (
    <div className="relative inline-block">
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "relative", width: `${width}px`, height: `${height}px`, transformStyle: "preserve-3d", transition: spring }}>
          {/* Nội dung */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: `${width}px`, height: `${height}px`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "translateZ(20px)", zIndex: 30, pointerEvents: "none",
          }}>
            {children}
          </div>
          {/* Lớp đen trong */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: `${width}px`, height: `${height}px`,
            transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : ""}`, zIndex: 20, transition: spring,
          }}>
            <div style={{
              width: `${width - 4}px`, height: `${height - 4}px`, margin: "2px", borderRadius: "14px",
              background: "linear-gradient(180deg, #202020 0%, #000000 100%)",
              boxShadow: isPressed ? "inset 0px 2px 4px rgba(0,0,0,0.4)" : "none",
              transition: spring,
            }} />
          </div>
          {/* Viền ngoài */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: `${width}px`, height: `${height}px`,
            transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : ""}`, zIndex: 10, transition: spring,
          }}>
            <div style={{
              borderRadius: "16px", overflow: "hidden",
              boxShadow: isPressed
                ? "0px 0px 0px 1px rgba(0,0,0,0.5)"
                : isHovered
                  ? "0px 0px 0px 1px rgba(0,0,0,0.4), 0px 12px 6px rgba(0,0,0,0.05), 0px 4px 4px rgba(0,0,0,0.15)"
                  : "0px 0px 0px 1px rgba(0,0,0,0.3), 0px 20px 12px rgba(0,0,0,0.08), 0px 9px 9px rgba(0,0,0,0.12)",
              transition: spring,
            }}>
              <div ref={shaderRef} className="shader-card-container" style={{
                width: `${width}px`, height: `${height}px`, position: "relative",
                transition: "width 0.4s ease, height 0.4s ease",
              }} />
            </div>
          </div>
          {/* Nút ấn */}
          <button
            ref={buttonRef}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute", top: 0, left: 0, width: `${width}px`, height: `${height}px`,
              background: "transparent", border: "none", cursor: "pointer", outline: "none",
              zIndex: 40, transform: "translateZ(25px)", borderRadius: "16px",
            }}
            aria-label="card"
          />
        </div>
      </div>
    </div>
  );
}