"use client";

import { Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { user } = useAuth();
  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Settings size={18} className="text-gray-600" />
        </button>
        <div
          title={user?.email ?? ""}
          className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
