"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { NAV_ITEMS, type TabId } from "@/components/layout/navItems";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

export function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  onAccount,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  collapsed: boolean;
  onAccount: () => void;
}) {
  const { staff } = useAuth();

  return (
    <div
      className={`hidden lg:flex lg:flex-col lg:justify-between bg-[#f8f9fa] border-r h-screen fixed left-0 top-0 transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        <div className="h-16 px-4 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center shrink-0">
            <span className="font-bold text-gray-500 text-xs">CC</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">Canotaje Córdoba</h1>
              <p className="text-xs text-gray-500 capitalize truncate">{staff?.rol ?? "Cargando..."}</p>
            </div>
          )}
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={18} className={`shrink-0 ${activeTab === item.id ? "text-gray-900" : "text-gray-400"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <ProfileMenu variant="sidebar" collapsed={collapsed} onAccount={onAccount} />
      </div>
    </div>
  );
}
