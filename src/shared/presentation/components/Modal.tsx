import React from "react";
import Dialog from "./Dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} className={className}>
      {children}
    </Dialog>
  );
}
