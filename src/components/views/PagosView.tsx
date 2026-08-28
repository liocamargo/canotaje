"use client";

import { useMemo, useState } from "react";
import { CreditCard, Download, FileText, Mail, Search, Trash2 } from "lucide-react";
import { usePagos, deletePago } from "@/lib/data/pagos";
import { useSocios } from "@/lib/data/socios";
import { getPeriodoActual } from "@/lib/format";
import { RegistrarPagoModal } from "@/components/shared/RegistrarPagoModal";

export function PagosView() {
  const { data: pagos, loading } = usePagos();
  const { data: socios } = useSocios();

  const [showNewPago, setShowNewPago] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const periodoActual = useMemo(() => getPeriodoActual(), []);

  const sociosQuePagaron = useMemo(() => {
    const ids = new Set(
      pagos.filter((p) => p.periodo === periodoActual).map((p) => p.socioId)
    );
    return ids.size;
  }, [pagos, periodoActual]);

  const filteredPagos = pagos.filter((p) =>
    p.socio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePago = async (id: string) => {
    if (window.confirm("¿Seguro que querés eliminar este pago?")) {
      await deletePago(id);
    }
  };

  return (
    <div className="px-4 lg:px-6 py-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-sm text-gray-500">
          {periodoActual} - {sociosQuePagaron} de {socios.length} Socios Pagaron
        </p>
        <div className="flex gap-2">
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed"
          >
            <Download size={16} /> Exportar
          </button>
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed"
          >
            <Mail size={16} /> Enviar recordatorios
          </button>
          <button
            onClick={() => setShowNewPago(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            <CreditCard size={16} /> Registrar pago
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      {/* Historial */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Cargando pagos...</div>
        ) : filteredPagos.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No se encontraron pagos registrados.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                <th className="px-6 py-3 font-medium text-gray-500">Período</th>
                <th className="px-6 py-3 font-medium text-gray-500">Fecha de pago</th>
                <th className="px-6 py-3 font-medium text-gray-500">Método</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-right">Monto</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      {pago.socio
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    {pago.socio}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pago.periodo}</td>
                  <td className="px-6 py-4 text-gray-600">{pago.fecha}</td>
                  <td className="px-6 py-4 text-gray-600">{pago.metodo}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 text-right">
                    {pago.monto}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-900">
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePago(pago.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RegistrarPagoModal open={showNewPago} onClose={() => setShowNewPago(false)} socios={socios} />
    </div>
  );
}
