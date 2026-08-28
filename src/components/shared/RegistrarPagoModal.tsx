"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Search, X } from "lucide-react";
import { addPago } from "@/lib/data/pagos";
import { getFechaHoy, getPeriodoActual } from "@/lib/format";
import type { MetodoPago, Socio } from "@/lib/types";

const METODOS: MetodoPago[] = ["Efectivo", "Transferencia", "Tarjeta"];

export function RegistrarPagoModal({
  open,
  onClose,
  socios,
  initialSocio,
}: {
  open: boolean;
  onClose: () => void;
  socios: Socio[];
  initialSocio?: Socio | null;
}) {
  const periodoActual = getPeriodoActual();

  const [socioSearch, setSocioSearch] = useState("");
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [monto, setMonto] = useState("15000");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia el formulario cada vez que se abre el modal
    setSocioSearch(initialSocio ? initialSocio.nombreCompleto : "");
    setSelectedSocio(initialSocio ?? null);
    setMonto("15000");
    setMetodo("Efectivo");
  }, [open, initialSocio]);

  if (!open) return null;

  const filteredSocios = socios.filter((s) => {
    const term = socioSearch.toLowerCase();
    if (!term) return false;
    return (
      s.nombreCompleto.toLowerCase().includes(term) ||
      s.dni.toLowerCase().includes(term)
    );
  });

  const handleRegistrarPago = async () => {
    if (!selectedSocio) return;
    setSubmitting(true);
    try {
      await addPago({
        socioId: selectedSocio.id,
        socio: selectedSocio.nombreCompleto,
        periodo: periodoActual,
        fecha: getFechaHoy(),
        metodo,
        monto: Number(monto),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Registrar nuevo pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar socio</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={socioSearch}
                onChange={(e) => {
                  setSocioSearch(e.target.value);
                  setSelectedSocio(null);
                }}
                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            {socioSearch && !selectedSocio && (
              <div className="mt-2 border rounded-md max-h-40 overflow-y-auto divide-y">
                {filteredSocios.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">No se encontraron socios.</p>
                ) : (
                  filteredSocios.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSocio(s);
                        setSocioSearch(s.nombreCompleto);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{s.nombreCompleto}</span>{" "}
                      <span className="text-gray-500">DNI {s.dni}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedSocio && (
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
                      <td className="py-2 text-gray-600">{selectedSocio.nombreCompleto}</td>
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
          <button onClick={onClose} className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleRegistrarPago}
            disabled={!selectedSocio || submitting}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Registrar pago
          </button>
        </div>
      </div>
    </div>
  );
}
