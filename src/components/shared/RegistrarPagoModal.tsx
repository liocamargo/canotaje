"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { addPagosBatch } from "@/lib/data/pagos";
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

  const [search, setSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [monto, setMonto] = useState("15000");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia el formulario cada vez que se abre el modal
    setSearch("");
    setSeleccionados(new Set(initialSocio ? [initialSocio.id] : []));
    setMonto("15000");
    setMetodo("Efectivo");
  }, [open, initialSocio]);

  if (!open) return null;

  const filtrados = socios.filter((s) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return s.nombreCompleto.toLowerCase().includes(term) || s.dni.toLowerCase().includes(term);
  });

  const toggleSocio = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const todosFiltradosSeleccionados =
    filtrados.length > 0 && filtrados.every((s) => seleccionados.has(s.id));

  const toggleTodos = () => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosFiltradosSeleccionados) {
        filtrados.forEach((s) => next.delete(s.id));
      } else {
        filtrados.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const handleRegistrarPagos = async () => {
    if (seleccionados.size === 0) return;
    setSubmitting(true);
    try {
      const fecha = getFechaHoy();
      const montoNum = Number(monto) || 0;
      const sociosSeleccionados = socios.filter((s) => seleccionados.has(s.id));
      await addPagosBatch(
        sociosSeleccionados.map((s) => ({
          socioId: s.id,
          socio: s.nombreCompleto,
          periodo: periodoActual,
          fecha,
          metodo,
          monto: montoNum,
        }))
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-semibold text-lg">Registrar pago</h3>
            <p className="text-sm text-gray-500">Período: {periodoActual}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div className="border rounded-lg divide-y max-h-56 overflow-y-auto">
            <label className="flex items-center gap-3 px-3 py-2 text-sm bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={todosFiltradosSeleccionados}
                onChange={toggleTodos}
                className="rounded border-gray-300"
              />
              <span className="font-medium text-gray-700">Seleccionar todos</span>
            </label>
            {filtrados.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">No se encontraron socios.</p>
            ) : (
              filtrados.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSocio(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                    seleccionados.has(s.id) ? "bg-gray-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionados.has(s.id)}
                    onChange={() => toggleSocio(s.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{s.nombreCompleto}</span>
                  <span className="text-gray-500">DNI {s.dni}</span>
                </button>
              ))
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monto por persona</label>
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
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegistrarPagos}
            disabled={seleccionados.size === 0 || submitting}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Registrando..."
              : seleccionados.size > 0
                ? `Registrar ${seleccionados.size} pago${seleccionados.size === 1 ? "" : "s"}`
                : "Registrar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
