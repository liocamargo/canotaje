"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { NAV_ITEMS, type TabId } from "@/components/layout/navItems";

export function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}) {
  const { staff, logOut } = useAuth();

  return (
    <div className="hidden md:flex md:flex-col md:justify-between w-64 bg-[#f8f9fa] border-r h-screen fixed left-0 top-0">
      <div>
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <span className="font-bold text-gray-500 text-xs">CC</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Canotaje Córdoba</h1>
            <p className="text-xs text-gray-500 capitalize">{staff?.rol ?? "Cargando..."}</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? "text-gray-900" : "text-gray-400"} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={() => logOut()}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
        <p className="text-xs text-gray-400 text-center mt-4">v1.0.0</p>
      </div>
    </div>
  );
}
