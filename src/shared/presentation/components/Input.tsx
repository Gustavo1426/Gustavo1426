import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  type?: string;
}

export default function Input({
  label,
  error,
  className = "",
  type = "text",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col space-y-1 w-full font-mono text-xs">
      {label && <label className="text-gray-400 font-semibold">{label}</label>}
      <input
        type={type}
        className={`bg-[#161719] border border-[#2d3139] hover:border-gray-700 focus:border-[#00f2ff]/50 rounded-xl px-4 py-2.5 text-[#e3e2e4] focus:outline-none focus:ring-1 focus:ring-[#00f2ff]/20 transition-all ${
          error ? "border-red-500/50 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-[10px]">{error}</span>}
    </div>
  );
}
