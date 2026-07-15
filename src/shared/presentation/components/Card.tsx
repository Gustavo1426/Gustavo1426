import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  glow = false,
  className = "",
  ...props
}: CardProps) {
  const baseStyle = "glass-panel bg-[#1a1c1e]/90 border border-[#2d3139]/50 rounded-2xl p-6 transition-all duration-300";
  const glowStyle = glow ? "shadow-[0_0_30px_rgba(0,242,255,0.05)] border-[#00f2ff]/20" : "";

  return (
    <div
      className={`${baseStyle} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
