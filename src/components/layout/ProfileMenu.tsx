"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export function ProfileMenu({
  variant,
  collapsed,
  onAccount,
}: {
  variant: "sidebar" | "header";
  collapsed?: boolean;
  onAccount: () => void;
}) {
  const { user, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div
          className={`absolute w-48 bg-white border rounded-lg shadow-lg py-1 z-50 ${
            variant === "sidebar" ? "bottom-full left-0 mb-2" : "top-full right-0 mt-2"
          }`}
        >
          <button
            onClick={() => {
              setOpen(false);
              onAccount();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <User size={16} /> Mi cuenta
          </button>
          <button
            onClick={() => logOut()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}

      {variant === "sidebar" ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium shrink-0">
            {initials}
          </div>
          {!collapsed && <span className="truncate">Perfil</span>}
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          title="Perfil"
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
        </button>
      )}
    </div>
  );
}
