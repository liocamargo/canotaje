"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

export function Header({
  title,
  collapsed,
  onToggleCollapsed,
  onAccount,
}: {
  title: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onAccount: () => void;
}) {
  return (
    <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? "Expandir menú" : "Achicar menú a solo íconos"}
          className="hidden md:flex p-2 hover:bg-gray-100 rounded-full text-gray-600 shrink-0"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <h2 className="text-xl font-semibold text-gray-800 truncate">{title}</h2>
      </div>

      <div className="md:hidden">
        <ProfileMenu variant="header" onAccount={onAccount} />
      </div>
    </header>
  );
}
