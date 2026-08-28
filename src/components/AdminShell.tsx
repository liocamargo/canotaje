"use client";

import { useRef, useState } from "react";
import { CheckCircle2, CreditCard, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { type TabId } from "@/components/layout/navItems";
import { Header } from "@/components/layout/Header";
import { SociosView, type SociosViewHandle } from "@/components/views/SociosView";
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
  const [breadcrumbExtra, setBreadcrumbExtra] = useState<string | null>(null);
  const sociosRef = useRef<SociosViewHandle>(null);

  const title = breadcrumbExtra ? `${TITLES[activeTab]} | ${breadcrumbExtra}` : TITLES[activeTab];

  const headerActions =
    activeTab === "socios" ? (
      <>
        <button
          onClick={() => sociosRef.current?.activarAsistencia()}
          className="flex items-center gap-2 px-2 lg:px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
        >
          <CheckCircle2 size={16} />
          <span className="hidden sm:inline">Registrar asistencia</span>
        </button>
        <button
          onClick={() => sociosRef.current?.abrirRegistrarPago()}
          className="flex items-center gap-2 px-2 lg:px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
        >
          <CreditCard size={16} />
          <span className="hidden sm:inline">Registrar pago</span>
        </button>
        <button
          onClick={() => sociosRef.current?.abrirNuevoSocio()}
          className="flex items-center gap-2 px-2 lg:px-3 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo socio</span>
        </button>
      </>
    ) : null;

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-gray-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        onAccount={() => setActiveTab("cuenta")}
      />

      <main
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-200 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <Header
          title={title}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onAccount={() => setActiveTab("cuenta")}
          actions={headerActions}
        />

        <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {activeTab === "socios" && (
            <SociosView ref={sociosRef} onBreadcrumbChange={setBreadcrumbExtra} />
          )}
          {activeTab === "pagos" && <PagosView onBreadcrumbChange={setBreadcrumbExtra} />}
          {activeTab === "actividades" && <ActividadesView onBreadcrumbChange={setBreadcrumbExtra} />}
          {activeTab === "colaboradores" && (
            <ColaboradoresView onBreadcrumbChange={setBreadcrumbExtra} />
          )}
          {activeTab === "configuracion" && <ConfiguracionView />}
          {activeTab === "cuenta" && <MiCuentaView />}
        </div>
      </main>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
