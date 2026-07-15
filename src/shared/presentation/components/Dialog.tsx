import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Dialog({ isOpen, onClose, title, children, className = "" }: DialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`glass-panel w-full max-w-lg rounded-xl relative shadow-[0_0_40px_rgba(0,242,255,0.15)] overflow-hidden bg-[#1f2022] border border-[#3a494b]/40 text-[#e3e2e4] ${className}`}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#00f2ff]/5">
              {title && <h3 className="font-bold text-base text-white font-mono">{title}</h3>}
              <button
                onClick={onClose}
                className="text-[#b9cacb] hover:text-white transition-colors cursor-pointer ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
