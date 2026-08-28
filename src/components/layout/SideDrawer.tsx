"use client";

import type { ReactNode } from "react";

export function SideDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l animate-in slide-in-from-right duration-300">
        {children}
      </div>
    </div>
  );
}
