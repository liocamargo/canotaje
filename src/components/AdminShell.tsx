"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { type TabId } from "@/components/layout/navItems";
import { Header } from "@/components/layout/Header";
import { SociosView } from "@/components/views/SociosView";
import { PagosView } from "@/components/views/PagosView";
import { ActividadesView } from "@/components/views/ActividadesView";
import { ColaboradoresView } from "@/components/views/ColaboradoresView";
import { ConfiguracionView } from "@/components/views/ConfiguracionView";
import { MiCuentaView } from "@/components/views/MiCuentaView";

const TITLES: Record<TabId, string> = {
  socios: "Socios",
  pagos: "Pagos",
  actividades: "Actividades y Regatas",
  colaboradores: "Colaboradores",
  configuracion: "Configuración",
  cuenta: "Mi cuenta",
};

export function AdminShell() {
  const [activeTab, setActiveTab] = useState<TabId>("socios");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-gray-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        onAccount={() => setActiveTab("cuenta")}
      />

      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-200 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        <Header
          title={TITLES[activeTab]}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onAccount={() => setActiveTab("cuenta")}
        />

        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {activeTab === "socios" && <SociosView />}
          {activeTab === "pagos" && <PagosView />}
          {activeTab === "actividades" && <ActividadesView />}
          {activeTab === "colaboradores" && <ColaboradoresView />}
          {activeTab === "configuracion" && <ConfiguracionView />}
          {activeTab === "cuenta" && <MiCuentaView />}
        </div>
      </main>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
