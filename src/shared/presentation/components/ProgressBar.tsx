import React from "react";
import { motion } from "motion/react";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number; // default 100
  color?: "cyan" | "purple" | "emerald" | "pink";
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "cyan",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    cyan: "bg-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.4)]",
    purple: "bg-[#b601f8] shadow-[0_0_10px_rgba(182,1,248,0.4)]",
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
    pink: "bg-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-mono mb-1 text-[#b9cacb]">
          <span>Progresso</span>
          <span className="font-bold text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-[#1b1c1e] rounded-full overflow-hidden border border-[#3a494b]/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}
