"use client";

import { useState } from "react";
import {
  Calendar,
  Car,
  Download,
  Flag,
  MapPin,
  Plus,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { SideDrawer } from "@/components/layout/SideDrawer";
import { addActividad, useActividades } from "@/lib/data/actividades";
import {
  addInscripcion,
  deleteInscripcion,
  useInscripcionesPorActividad,
} from "@/lib/data/inscripciones";
import type { ActividadEstado, ActividadTipo } from "@/lib/types";

const TIPOS: ActividadTipo[] = ["Regata", "Travesía"];
const ESTADOS: ActividadEstado[] = ["Planificación", "Confirmada", "Próxima", "Finalizada"];

type DrawerTab = "detalles" | "logistica";
type SubTab = "proximas" | "pasadas";

const emptyForm = {
  titulo: "",
  fecha: "",
  tipo: "Regata" as ActividadTipo,
  lugar: "",
  estado: "Planificación" as ActividadEstado,
  descripcion: "",
};

const emptyParticipanteForm = {
  socio: "",
  vehiculo: "",
  bote: "",
  pala: "",
};

export function ActividadesView() {
  const { data: actividades, loading } = useActividades();

  const [selectedActividadId, setSelectedActividadId] = useState<string | null>(null);
  const [actividadTab, setActividadTab] = useState<DrawerTab>("detalles");
  const [subTab, setSubTab] = useState<SubTab>("proximas");

  const [showNewActividad, setShowNewActividad] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [showAddParticipante, setShowAddParticipante] = useState(false);
  const [participanteForm, setParticipanteForm] = useState(emptyParticipanteForm);
  const [submittingParticipante, setSubmittingParticipante] = useState(false);

  const selectedActividad = actividades.find((a) => a.id === selectedActividadId) ?? null;

  // El hook se llama siempre (con id vacío si no hay actividad seleccionada) para no
  // violar las reglas de hooks; cuando no hay selección los datos simplemente no se usan.
  const { data: inscripciones } = useInscripcionesPorActividad(selectedActividad?.id ?? "");

  // El mock original usaba fechas para separar "próximas" de "pasadas", pero acá las
  // fechas son texto libre (dd/mm/aaaa) y no son confiables para comparar. Usamos el
  // campo `estado` como proxy: "Finalizada" = pasada, cualquier otro estado = próxima.
  const actividadesProximas = actividades.filter((a) => a.estado !== "Finalizada");
  const actividadesPasadas = actividades.filter((a) => a.estado === "Finalizada");
  const actividadesFiltradas = subTab === "proximas" ? actividadesProximas : actividadesPasadas;

  const closeDrawer = () => {
    setSelectedActividadId(null);
    setActividadTab("detalles");
    setShowAddParticipante(false);
    setParticipanteForm(emptyParticipanteForm);
  };

  const closeNewActividadModal = () => {
    setShowNewActividad(false);
    setForm(emptyForm);
  };

  const handleCrearActividad = async () => {
    if (!form.titulo.trim() || !form.fecha.trim() || !form.lugar.trim()) return;
    setSubmitting(true);
    try {
      await addActividad({ ...form });
      closeNewActividadModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAgregarParticipante = async () => {
    if (!selectedActividad || !participanteForm.socio.trim()) return;
    setSubmittingParticipante(true);
    try {
      await addInscripcion({
        actividadId: selectedActividad.id,
        socioId: "",
        socio: participanteForm.socio,
        vehiculo: participanteForm.vehiculo,
        bote: participanteForm.bote,
        pala: participanteForm.pala,
        confirmado: true,
      });
      setParticipanteForm(emptyParticipanteForm);
      setShowAddParticipante(false);
    } finally {
      setSubmittingParticipante(false);
    }
  };

  const handleEliminarParticipante = async (id: string) => {
    if (window.confirm("¿Seguro que querés eliminar este participante?")) {
      await deleteInscripcion(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Actividades y Regatas</h3>
          <p className="text-sm text-gray-500">Gestioná eventos, viajes y la asignación de botes</p>
        </div>
        <button
          onClick={() => setShowNewActividad(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} /> Nueva actividad
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setSubTab("proximas")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            subTab === "proximas"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => setSubTab("pasadas")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            subTab === "pasadas"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pasadas
        </button>
      </div>

      {/* Grid de Eventos */}
      {loading ? (
        <div className="p-10 text-center text-gray-500 text-sm">Cargando actividades...</div>
      ) : actividadesFiltradas.length === 0 ? (
        <div className="p-10 text-center text-gray-500 text-sm">
          No hay actividades {subTab === "proximas" ? "próximas" : "pasadas"}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {actividadesFiltradas.map((act) => (
            <div
              key={act.id}
              onClick={() => setSelectedActividadId(act.id)}
              className="bg-white border rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md border ${
                    act.tipo === "Regata"
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}
                >
                  {act.tipo}
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {act.estado}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 text-base mb-4 group-hover:text-blue-600 transition-colors">
                {act.titulo}
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{act.fecha}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{act.lugar}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panel Lateral: Detalle de Actividad */}
      <SideDrawer isOpen={!!selectedActividad} onClose={closeDrawer}>
        {selectedActividad && (
          <>
            {/* Drawer Header */}
            <div className="flex justify-between items-start p-6 border-b bg-gray-50/50">
              <div>
                <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md border bg-white text-gray-600 border-gray-200 mb-2">
                  {selectedActividad.tipo}
                </span>
                <h3 className="font-semibold text-xl text-gray-900">{selectedActividad.titulo}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin size={14} /> {selectedActividad.lugar}
                </p>
              </div>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex px-6 border-b overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActividadTab("detalles")}
                className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${
                  actividadTab === "detalles"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Info General
              </button>
              <button
                onClick={() => setActividadTab("logistica")}
                className={`py-3 text-sm font-medium border-b-2 shrink-0 ${
                  actividadTab === "logistica"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Participantes & Logística
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {actividadTab === "detalles" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                        <Calendar size={14} /> Fecha
                      </p>
                      <p className="font-semibold text-gray-900">{selectedActividad.fecha}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                        <UsersRound size={14} /> Inscritos
                      </p>
                      <p className="font-semibold text-gray-900">{inscripciones.length} palistas</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Descripción</h4>
                    {selectedActividad.descripcion ? (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedActividad.descripcion}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Sin descripción.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">Planilla de Logística</h4>
                    <button
                      onClick={() => window.print()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Download size={14} /> Imprimir lista
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAddParticipante((v) => !v)}
                    className="text-xs font-medium text-gray-700 border rounded-md px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Plus size={14} /> Agregar participante
                  </button>

                  {showAddParticipante && (
                    <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Socio</label>
                        <input
                          type="text"
                          value={participanteForm.socio}
                          onChange={(e) =>
                            setParticipanteForm((f) => ({ ...f, socio: e.target.value }))
                          }
                          placeholder="Nombre y apellido"
                          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Vehículo
                          </label>
                          <input
                            type="text"
                            value={participanteForm.vehiculo}
                            onChange={(e) =>
                              setParticipanteForm((f) => ({ ...f, vehiculo: e.target.value }))
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Bote</label>
                          <input
                            type="text"
                            value={participanteForm.bote}
                            onChange={(e) =>
                              setParticipanteForm((f) => ({ ...f, bote: e.target.value }))
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Pala</label>
                          <input
                            type="text"
                            value={participanteForm.pala}
                            onChange={(e) =>
                              setParticipanteForm((f) => ({ ...f, pala: e.target.value }))
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowAddParticipante(false);
                            setParticipanteForm(emptyParticipanteForm);
                          }}
                          className="px-3 py-1.5 border bg-white rounded-md text-xs font-medium hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAgregarParticipante}
                          disabled={!participanteForm.socio.trim() || submittingParticipante}
                          className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {inscripciones.length === 0 ? (
                      <p className="text-sm text-gray-400">Todavía no hay participantes anotados.</p>
                    ) : (
                      inscripciones.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 border rounded-xl bg-white shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between pb-3 border-b">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600">
                                {item.socio
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <span className="font-medium text-sm text-gray-900">{item.socio}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-md border ${
                                  item.confirmado
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-gray-50 text-gray-500 border-gray-200"
                                }`}
                              >
                                {item.confirmado ? "Confirmado" : "Pendiente"}
                              </span>
                              <button
                                onClick={() => handleEliminarParticipante(item.id)}
                                className="text-gray-400 hover:text-red-600 p-1"
                                title="Eliminar participante"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                                <Car size={12} /> Viaje
                              </p>
                              <p className="text-sm text-gray-700">{item.vehiculo || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                                <Flag size={12} /> Bote Asignado
                              </p>
                              <p className="text-sm text-gray-700 font-medium">{item.bote || "—"}</p>
                            </div>
                          </div>
                          {item.pala && (
                            <p className="text-xs text-gray-500">Pala: {item.pala}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SideDrawer>

      {/* Modal de Nueva Actividad */}
      {showNewActividad && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Nueva actividad</h3>
              <button onClick={closeNewActividadModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Regata Provincial Córdoba"
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="text"
                    value={form.fecha}
                    onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                    placeholder="dd/mm/aaaa"
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tipo: e.target.value as ActividadTipo }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                  <input
                    type="text"
                    value={form.lugar}
                    onChange={(e) => setForm((f) => ({ ...f, lugar: e.target.value }))}
                    placeholder="Villa Carlos Paz"
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, estado: e.target.value as ActividadEstado }))
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeNewActividadModal}
                className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearActividad}
                disabled={
                  !form.titulo.trim() || !form.fecha.trim() || !form.lugar.trim() || submitting
                }
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear actividad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
