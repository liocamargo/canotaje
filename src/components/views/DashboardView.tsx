"use client";

import { CheckCircle2, Users, AlertCircle } from "lucide-react";
import { useCollection } from "@/lib/data/useCollection";
import type { Pago, Socio } from "@/lib/types";

export function DashboardView() {
  const { data: socios, loading: loadingSocios } = useCollection<Socio>("socios");
  const { data: pagos, loading: loadingPagos } = useCollection<Pago>("pagos");

  const loading = loadingSocios || loadingPagos;
  const now = new Date();
  const periodoActual = now
    .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const pagosDelMes = pagos.filter((p) => p.periodo === periodoActual);
  const sociosQuePagaron = new Set(pagosDelMes.map((p) => p.socioId));
  const pendientes = socios.filter((s) => !sociosQuePagaron.has(s.id));
  const recaudado = pagosDelMes.reduce((acc, p) => acc + (p.monto || 0), 0);
  const morosidad = socios.length ? (pendientes.length / socios.length) * 100 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          label="Total Socios"
          value={loading ? "…" : socios.length}
          icon={<Users size={16} className="text-gray-400" />}
        />
        <KpiCard
          label={`Pagados ${periodoActual}`}
          value={loading ? "…" : sociosQuePagaron.size}
          icon={<CheckCircle2 size={16} className="text-gray-400" />}
        />
        <KpiCard
          label="Pendientes"
          value={loading ? "…" : pendientes.length}
          icon={<AlertCircle size={16} className="text-gray-400" />}
        />
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500">Recaudado</h3>
              <div className="p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-400 font-bold">$</span>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {loading ? "…" : `$${recaudado.toLocaleString("es-AR")}`}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tasa de morosidad</p>
              <p className="text-sm font-bold">{loading ? "…" : `${morosidad.toFixed(1)}%`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
