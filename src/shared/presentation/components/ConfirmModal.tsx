import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const buttonColor = variant === "danger" 
    ? "bg-red-600 hover:bg-red-700 text-white border-red-500/20" 
    : variant === "warning"
    ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-500/20"
    : "bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500/20";

  const iconColor = variant === "danger"
    ? "text-red-500 bg-red-500/10 border-red-500/20"
    : variant === "warning"
    ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
    : "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className="glass-panel w-full max-w-md rounded-2xl relative shadow-[0_0_50px_rgba(0,242,255,0.15)] border border-gray-800 bg-[#121315]/95 overflow-hidden z-10 font-mono text-xs">
        {/* Glow Bar */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-xl border ${iconColor} shrink-0`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">{title}</h3>
              <p className="text-[11px] text-[#b9cacb] leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 ${buttonColor} border py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-md transition-all`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-[#1b1c1e] hover:bg-[#2a2b2d] text-[#b9cacb] hover:text-white border border-[#3a494b]/30 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
