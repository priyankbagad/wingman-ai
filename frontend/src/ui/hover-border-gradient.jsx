"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const movingMap = {
  TOP:    "radial-gradient(20.7% 50% at 50% 0%,    #6366f1 0%, rgba(99,102,241,0) 100%)",
  LEFT:   "radial-gradient(16.6% 43.1% at 0% 50%,  #8b5cf6 0%, rgba(139,92,246,0) 100%)",
  BOTTOM: "radial-gradient(20.7% 50% at 50% 100%,  #6366f1 0%, rgba(99,102,241,0) 100%)",
  RIGHT:  "radial-gradient(16.2% 41.2% at 100% 50%,#818cf8 0%, rgba(129,140,248,0) 100%)",
};

const highlight =
  "radial-gradient(75% 181.15% at 50% 50%, #6366f1 0%, rgba(99,102,241,0) 100%)";

const DIRS = ["TOP", "LEFT", "BOTTOM", "RIGHT"];

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState("TOP");

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => {
      setDirection((prev) => {
        const i = DIRS.indexOf(prev);
        return clockwise
          ? DIRS[(i - 1 + DIRS.length) % DIRS.length]
          : DIRS[(i + 1) % DIRS.length];
      });
    }, duration * 1000);
    return () => clearInterval(id);
  }, [hovered, clockwise, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex items-center justify-center rounded-full border border-white/20 bg-slate-950 overflow-visible p-px cursor-pointer transition-all duration-500",
        containerClassName
      )}
      {...props}
    >
      {/* Rotating gradient — renders as the visible border glow */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden z-0"
        style={{ filter: "blur(2px)" }}
        initial={{ background: movingMap.TOP }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: "linear", duration }}
      />

      {/* Dark fill — sits inside the 1px gradient ring */}
      <div className="absolute inset-[2px] rounded-full bg-slate-950 z-[1]" />

      {/* Content — inline style padding bypasses Tailwind scanning issues */}
      <div
        className={cn("relative z-20 flex items-center justify-center rounded-full", className)}
        style={{ padding: "0.75rem 2.5rem" }}
      >
        {children}
      </div>
    </Tag>
  );
}
