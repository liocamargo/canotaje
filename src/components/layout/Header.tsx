"use client";

import type { ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import type { BreadcrumbExtra } from "@/components/layout/breadcrumb";

export function Header({
  title,
  breadcrumbExtra,
  collapsed,
  onToggleCollapsed,
  onAccount,
  actions,
}: {
  title: string;
  breadcrumbExtra?: BreadcrumbExtra | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onAccount: () => void;
  actions?: ReactNode;
}) {
  return (
    <header className="h-16 bg-white border-b px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? "Expandir menú" : "Achicar menú a solo íconos"}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-full text-gray-600 shrink-0"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {breadcrumbExtra ? (
          <div className="flex items-center gap-1.5 min-w-0 text-xl font-semibold">
            <button
              onClick={breadcrumbExtra.onReset}
              className="text-gray-500 hover:text-gray-900 truncate"
            >
              {title}
            </button>
            <span className="text-gray-300">|</span>
            <h2 className="text-gray-800 truncate">{breadcrumbExtra.label}</h2>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-gray-800 truncate">{title}</h2>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <div className="lg:hidden">
          <ProfileMenu variant="header" onAccount={onAccount} />
        </div>
      </div>
    </header>
  );
}
