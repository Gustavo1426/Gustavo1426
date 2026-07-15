import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  className?: string;
}

export default function Loading({ message = "Carregando...", className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-3 ${className}`}>
      <Loader2 className="w-8 h-8 text-[#00f2ff] animate-spin" />
      {message && <p className="text-xs font-mono text-gray-500 animate-pulse">{message}</p>}
    </div>
  );
}
