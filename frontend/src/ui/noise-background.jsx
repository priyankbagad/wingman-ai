"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

export function NoiseBackground({
  children,
  className,
  containerClassName,
  gradientColors = ["rgb(99, 102, 241)", "rgb(139, 92, 246)", "rgb(59, 130, 246)"],
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.random() * 255;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 15;
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <div className={cn("relative", containerClassName)}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.join(", ")})`,
          padding: "1.5px",
          borderRadius: "9999px",
        }}
      >
        <div className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))" }}
        />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-full opacity-20 mix-blend-overlay pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
