"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { type TabId } from "@/components/layout/navItems";
import { Header } from "@/components/layout/Header";
import { DashboardView } from "@/components/views/DashboardView";
import { SociosView } from "@/components/views/SociosView";
import { PagosView } from "@/components/views/PagosView";
import { ActividadesView } from "@/components/views/ActividadesView";
import { ColaboradoresView } from "@/components/views/ColaboradoresView";
import { ConfiguracionView } from "@/components/views/ConfiguracionView";

const HEADER_INFO: Record<TabId, { title: string; subtitle: string }> = {
  inicio: { title: "Inicio", subtitle: "Resumen de tu gestión de socios" },
  socios: { title: "Socios", subtitle: "Gestiona los socios del club" },
  pagos: { title: "Pagos", subtitle: "Gestión de cuotas y pagos mensuales" },
  actividades: { title: "Actividades y Regatas", subtitle: "Gestioná eventos, viajes y logística" },
  colaboradores: { title: "Colaboradores", subtitle: "Gestioná el equipo con acceso al panel" },
  configuracion: { title: "Configuración", subtitle: "Ajustes del sistema" },
};

export function AdminShell() {
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const headerInfo = HEADER_INFO[activeTab];

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} />

        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {activeTab === "inicio" && <DashboardView />}
          {activeTab === "socios" && <SociosView />}
          {activeTab === "pagos" && <PagosView />}
          {activeTab === "actividades" && <ActividadesView />}
          {activeTab === "colaboradores" && <ColaboradoresView />}
          {activeTab === "configuracion" && <ConfiguracionView />}
        </div>
      </main>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
