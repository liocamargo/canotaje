"use client";

import { NAV_ITEMS, type TabId } from "@/components/layout/navItems";

export function BottomTabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t flex">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] min-w-0 ${
            activeTab === item.id ? "text-gray-900" : "text-gray-400"
          }`}
        >
          <item.icon size={20} className={activeTab === item.id ? "text-gray-900" : "text-gray-400"} />
          <span className="text-[10px] font-medium truncate max-w-full px-0.5">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
