"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Download,
  FileText,
  Mail,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { usePagos, addPago, deletePago } from "@/lib/data/pagos";
import { useSocios } from "@/lib/data/socios";
import type { MetodoPago, Socio } from "@/lib/types";

function getPeriodoActual(): string {
  const now = new Date();
  const mes = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(now);
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  return `${mesCapitalizado} De ${now.getFullYear()}`;
}

function getFechaHoy(): string {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, "0");
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${now.getFullYear()}`;
}

const METODOS: MetodoPago[] = ["Efectivo", "Transferencia", "Tarjeta"];

export function PagosView() {
  const { data: pagos, loading } = usePagos();
  const { data: socios } = useSocios();

  const [showNewPago, setShowNewPago] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagoTab, setPagoTab] = useState<"estado" | "historial">("estado");

  const [socioSearch, setSocioSearch] = useState("");
  const [selectedSocioParaPago, setSelectedSocioParaPago] = useState<Socio | null>(null);
  const [monto, setMonto] = useState("15000");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [submitting, setSubmitting] = useState(false);

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

  const filteredSociosParaModal = socios.filter((s) => {
    const term = socioSearch.toLowerCase();
    if (!term) return false;
    return (
      s.nombre.toLowerCase().includes(term) ||
      s.apellido.toLowerCase().includes(term) ||
      s.dni.toLowerCase().includes(term)
    );
  });

  const resetForm = () => {
    setSocioSearch("");
    setSelectedSocioParaPago(null);
    setMonto("15000");
    setMetodo("Efectivo");
  };

  const closeModal = () => {
    setShowNewPago(false);
    resetForm();
  };

  const handleRegistrarPago = async () => {
    if (!selectedSocioParaPago) return;
    setSubmitting(true);
    try {
      await addPago({
        socioId: selectedSocioParaPago.id,
        socio: `${selectedSocioParaPago.nombre} ${selectedSocioParaPago.apellido}`,
        periodo: periodoActual,
        fecha: getFechaHoy(),
        metodo,
        monto: Number(monto),
      });
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePago = async (id: string) => {
    if (window.confirm("¿Seguro que querés eliminar este pago?")) {
      await deletePago(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
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

      {/* Toolbar & Search */}
      <div className="mb-6">
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

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setPagoTab("estado")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              pagoTab === "estado"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Estado del mes
          </button>
          <button
            onClick={() => setPagoTab("historial")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              pagoTab === "historial"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Cargando pagos...</div>
        ) : pagoTab === "historial" ? (
          filteredPagos.length === 0 ? (
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
          )
        ) : (
          <div className="p-10 text-center text-gray-500 text-sm">
            No se encontraron socios con pagos registrados este mes.
          </div>
        )}
      </div>

      {/* Modal de Registro de Pago */}
      {showNewPago && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Registrar nuevo pago</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar socio
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    value={socioSearch}
                    onChange={(e) => {
                      setSocioSearch(e.target.value);
                      setSelectedSocioParaPago(null);
                    }}
                    className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                {socioSearch && !selectedSocioParaPago && (
                  <div className="mt-2 border rounded-md max-h-40 overflow-y-auto divide-y">
                    {filteredSociosParaModal.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">No se encontraron socios.</p>
                    ) : (
                      filteredSociosParaModal.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedSocioParaPago(s);
                            setSocioSearch(`${s.nombre} ${s.apellido}`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">
                            {s.nombre} {s.apellido}
                          </span>{" "}
                          <span className="text-gray-500">DNI {s.dni}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedSocioParaPago && (
                <>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1.5">
                      <AlertCircle size={16} /> A cobrar: $ {Number(monto || 0).toLocaleString("es-AR")}
                    </p>
                    <table className="w-full text-left text-sm mt-4">
                      <thead className="text-xs text-gray-500 border-b">
                        <tr>
                          <th className="pb-2 font-medium">Período</th>
                          <th className="pb-2 font-medium">Socio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 font-medium text-gray-900">{periodoActual}</td>
                          <td className="py-2 text-gray-600">
                            {selectedSocioParaPago.nombre} {selectedSocioParaPago.apellido}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto a pagar</label>
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Método de pago</label>
                    <div className="grid grid-cols-3 gap-2">
                      {METODOS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMetodo(m)}
                          className={
                            metodo === m
                              ? "py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-md"
                              : "py-2 px-4 border bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md"
                          }
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarPago}
                disabled={!selectedSocioParaPago || submitting}
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
