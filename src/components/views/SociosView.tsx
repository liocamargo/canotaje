"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { orderBy, where } from "firebase/firestore";
import {
  Calendar,
  CheckCircle2,
  Columns3,
  Download,
  Mail,
  Paperclip,
  Phone,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { SideDrawer } from "@/components/layout/SideDrawer";
import type { OnBreadcrumbChange } from "@/components/layout/breadcrumb";
import { RegistrarPagoModal } from "@/components/shared/RegistrarPagoModal";
import { useCollection } from "@/lib/data/useCollection";
import { addSocio, useSocios } from "@/lib/data/socios";
import { useTiposCuota } from "@/lib/data/tiposCuota";
import { useAsistenciasPorFecha, useAsistenciasPorSocio, toggleAsistencia } from "@/lib/data/asistencias";
import { uploadComprobante } from "@/lib/storage";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { Pago, Socio, SocioDeuda, SocioEstado } from "@/lib/types";

type SocioTab = "perfil" | "historial" | "asistencia";
type ColumnKey = "nombre" | "dni" | "telefono" | "tipoCuota";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  nombre: "Nombre",
  dni: "DNI",
  telefono: "Teléfono",
  tipoCuota: "Tipo de cuota",
};
const COLUMN_KEYS: ColumnKey[] = ["nombre", "dni", "telefono", "tipoCuota"];
const COLUMNS_STORAGE_KEY = "canotaje:sociosColumnas";

const ESTADOS: SocioEstado[] = ["Activo", "Pendiente", "Inactivo"];

const EMPTY_FORM = {
  nombreCompleto: "",
  estado: "Pendiente" as SocioEstado,
  email: "",
  telefono: "",
  dni: "",
  fechaNacimiento: "",
  contactoEmergencia: "",
  categoria: "",
  condicionMedica: "",
};

function initials(nombreCompleto: string) {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split("-");
  if (!y || !m || !d) return fecha;
  return `${d}/${m}/${y}`;
}

export interface SociosViewHandle {
  abrirNuevoSocio: () => void;
  abrirRegistrarPago: () => void;
  activarAsistencia: () => void;
}

interface SociosViewProps {
  onBreadcrumbChange?: OnBreadcrumbChange;
}

export const SociosView = forwardRef<SociosViewHandle, SociosViewProps>(function SociosView(
  { onBreadcrumbChange },
  ref
) {
  const { data: socios, loading } = useSocios();
  const { data: tiposCuota } = useTiposCuota();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showRegistrarPago, setShowRegistrarPago] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [socioTab, setSocioTab] = useState<SocioTab>("perfil");
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | SocioEstado>("todos");
  const [deudaFilter, setDeudaFilter] = useState<"todas" | SocioDeuda>("todas");
  const [form, setForm] = useState(EMPTY_FORM);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showColumnasMenu, setShowColumnasMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    nombre: true,
    dni: true,
    telefono: true,
    tipoCuota: true,
  });

  // --- Asistencia ---
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: asistenciasDelDia } = useAsistenciasPorFecha(attendanceDate);
  const attendanceMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    asistenciasDelDia.forEach((a) => {
      map[a.socioId] = a.presente;
    });
    return map;
  }, [asistenciasDelDia]);

  // --- Pagos e historial de asistencia del socio seleccionado ---
  const { data: pagosSocio } = useCollection<Pago>(
    "pagos",
    selectedSocio
      ? [where("socioId", "==", selectedSocio.id), orderBy("fecha", "desc")]
      : []
  );
  const { data: asistenciasSocio } = useAsistenciasPorSocio(selectedSocio?.id ?? "");

  const tipoCuotaPorDefecto = tiposCuota.find((c) => c.porDefecto) || tiposCuota[0];

  const finalizarAsistencia = () => {
    setIsTakingAttendance(false);
    setSearchTerm("");
  };

  useImperativeHandle(ref, () => ({
    abrirNuevoSocio: () => setShowNewModal(true),
    abrirRegistrarPago: () => setShowRegistrarPago(true),
    activarAsistencia: () => setIsTakingAttendance(true),
  }));

  useEffect(() => {
    onBreadcrumbChange?.(isTakingAttendance ? { label: "Asistencia", onReset: finalizarAsistencia } : null);
    return () => onBreadcrumbChange?.(null);
  }, [isTakingAttendance, onBreadcrumbChange]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (raw) {
        setVisibleColumns((prev) => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch {
      // localStorage puede no estar disponible (modo privado); se ignora y quedan las columnas por defecto.
    }
  }, []);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Se ignora si el navegador rechaza el acceso a localStorage.
      }
      return next;
    });
  };

  const toggleAttendance = async (socioId: string) => {
    const current = attendanceMap[socioId] ?? false;
    await toggleAsistencia(socioId, attendanceDate, !current);
  };

  const filteredSocios = socios.filter((socio) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      socio.nombreCompleto.toLowerCase().includes(term) ||
      socio.dni.includes(searchTerm) ||
      socio.email.toLowerCase().includes(term);
    const matchesEstado = estadoFilter === "todos" || socio.estado === estadoFilter;
    const matchesDeuda = deudaFilter === "todas" || socio.deuda === deudaFilter;
    return matchesSearch && matchesEstado && matchesDeuda;
  });

  const handleExportar = () => {
    const columns = COLUMN_KEYS.filter((c) => visibleColumns[c]);
    const header = columns.map((c) => COLUMN_LABELS[c]);
    const rows = filteredSocios.map((s) =>
      columns.map((c) => {
        if (c === "nombre") return s.nombreCompleto;
        if (c === "dni") return s.dni;
        if (c === "telefono") return s.telefono ?? "";
        return tiposCuota.find((t) => t.id === s.tipoCuotaId)?.nombre ?? "";
      })
    );
    downloadCsv(`socios-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]));
  };

  const handleCreateSocio = async () => {
    if (!form.nombreCompleto || !form.dni || !form.email) return;
    setSubmitting(true);
    try {
      let comprobanteInscripcionUrl: string | undefined;
      if (comprobanteFile) {
        comprobanteInscripcionUrl = await uploadComprobante(form.dni, comprobanteFile);
      }
      await addSocio({
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        dni: form.dni,
        telefono: form.telefono || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        contactoEmergencia: form.contactoEmergencia || undefined,
        categoria: form.categoria || undefined,
        condicionMedica: form.condicionMedica || undefined,
        comprobanteInscripcionUrl,
        estado: form.estado,
        deuda: "Al día",
        grupoFamiliar: null,
        tipoCuotaId: tipoCuotaPorDefecto?.id || "",
      });
      setForm(EMPTY_FORM);
      setComprobanteFile(null);
      setShowNewModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const asistenciaTotal = asistenciasSocio.length;
  const asistenciaPresentes = asistenciasSocio.filter((a) => a.presente).length;
  const asistenciaPorcentaje =
    asistenciaTotal > 0 ? Math.round((asistenciaPresentes / asistenciaTotal) * 100) : 0;

  const visibleColumnCount = COLUMN_KEYS.filter((c) => visibleColumns[c]).length || 1;

  return (
    <div className="px-4 lg:px-6 py-6">
      {/* Cabecera de asistencia */}
      {isTakingAttendance && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gray-900 p-4 rounded-xl shadow-sm text-white">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div>
              <h3 className="font-semibold text-lg">Control de Asistencia</h3>
              <p className="text-xs text-gray-300">Tocá para marcar presente. Se guarda solo.</p>
            </div>
            <div className="h-8 w-px bg-gray-700 mx-2 hidden sm:block"></div>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 text-white w-full sm:w-auto"
              style={{ colorScheme: "dark" }}
            />
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <button
            onClick={finalizarAsistencia}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 shrink-0"
          >
            <X size={16} /> Finalizar
          </button>
        </div>
      )}

      {!isTakingAttendance && (
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as "todos" | SocioEstado)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="todos">Todos</option>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1">Cuota del mes</label>
              <select
                value={deudaFilter}
                onChange={(e) => setDeudaFilter(e.target.value as "todas" | SocioDeuda)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="todas">Todas</option>
                <option value="Al día">Al día</option>
                <option value="Debe cuota">Deuda</option>
              </select>
            </div>
          </div>

          {/* Buscador, exportar, columnas */}
          <div className="flex flex-wrap gap-2 items-end">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, DNI o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              onClick={handleExportar}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
            >
              <Download size={16} /> Exportar
            </button>
            <div className="relative">
              <button
                onClick={() => setShowColumnasMenu((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
              >
                <Columns3 size={16} /> Columnas
              </button>
              {showColumnasMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-20">
                  {COLUMN_KEYS.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={() => toggleColumn(key)}
                        className="rounded border-gray-300"
                      />
                      {COLUMN_LABELS[key]}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            {isTakingAttendance ? (
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                <th className="px-6 py-3 font-medium text-gray-500">DNI</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-right">Estado de Asistencia</th>
              </tr>
            ) : (
              <tr>
                {visibleColumns.nombre && <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>}
                {visibleColumns.dni && <th className="px-6 py-3 font-medium text-gray-500">DNI</th>}
                {visibleColumns.telefono && <th className="px-6 py-3 font-medium text-gray-500">Teléfono</th>}
                {visibleColumns.tipoCuota && (
                  <th className="px-6 py-3 font-medium text-gray-500">Tipo de cuota</th>
                )}
              </tr>
            )}
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={isTakingAttendance ? 3 : visibleColumnCount}
                  className="text-center py-10 text-gray-500 text-sm"
                >
                  Cargando socios...
                </td>
              </tr>
            ) : (
              <>
                {filteredSocios.map((socio) => {
                  const isPresent = attendanceMap[socio.id] ?? false;

                  return (
                    <tr
                      key={socio.id}
                      className={`transition-colors ${
                        isTakingAttendance
                          ? isPresent
                            ? "bg-green-50/30"
                            : "hover:bg-gray-50"
                          : "hover:bg-gray-50 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isTakingAttendance) {
                          setSelectedSocio(socio);
                          setSocioTab("perfil");
                        }
                      }}
                    >
                      {isTakingAttendance ? (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                {initials(socio.nombreCompleto)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{socio.nombreCompleto}</p>
                                <p className="text-xs text-gray-500">{socio.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{socio.dni}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAttendance(socio.id);
                              }}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                isPresent
                                  ? "bg-green-100 text-green-700 border border-green-200 shadow-sm"
                                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              <CheckCircle2 size={16} className={isPresent ? "text-green-600" : "text-gray-400"} />
                              {isPresent ? "Presente" : "Marcar asistencia"}
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {visibleColumns.nombre && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {initials(socio.nombreCompleto)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{socio.nombreCompleto}</p>
                                  <p className="text-xs text-gray-500">{socio.email}</p>
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleColumns.dni && (
                            <td className="px-6 py-4 text-gray-600">{socio.dni}</td>
                          )}
                          {visibleColumns.telefono && (
                            <td className="px-6 py-4 text-gray-600">{socio.telefono || "—"}</td>
                          )}
                          {visibleColumns.tipoCuota && (
                            <td className="px-6 py-4">
                              <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                                {tiposCuota.find((c) => c.id === socio.tipoCuotaId)?.nombre || "Estándar"}
                              </span>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  );
                })}
                {filteredSocios.length === 0 && (
                  <tr>
                    <td
                      colSpan={isTakingAttendance ? 3 : visibleColumnCount}
                      className="text-center py-10 text-gray-500 text-sm"
                    >
                      No se encontraron socios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer: Detalle del Socio */}
      <SideDrawer isOpen={!!selectedSocio} onClose={() => setSelectedSocio(null)}>
        {selectedSocio && (
          <>
            <div className="flex justify-between items-start p-6 border-b bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-lg font-medium text-gray-600">
                  {initials(selectedSocio.nombreCompleto)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{selectedSocio.nombreCompleto}</h3>
                  <p className="text-sm text-gray-500">DNI: {selectedSocio.dni}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSocio(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex px-6 border-b overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSocioTab("perfil")}
                className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${
                  socioTab === "perfil" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Perfil
              </button>
              <button
                onClick={() => setSocioTab("historial")}
                className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${
                  socioTab === "historial" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pagos
              </button>
              <button
                onClick={() => setSocioTab("asistencia")}
                className={`py-3 text-sm font-medium border-b-2 shrink-0 ${
                  socioTab === "asistencia" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Asistencia
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {socioTab === "perfil" ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Estado</p>
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          selectedSocio.estado === "Activo"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {selectedSocio.estado}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium mb-1">Tipo de cuota</p>
                      <span className="font-medium text-gray-900">
                        {tiposCuota.find((c) => c.id === selectedSocio.tipoCuotaId)?.nombre || "Estándar"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Contacto</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-gray-50 rounded-md border text-gray-400">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">Email</p>
                          <p className="text-gray-900">{selectedSocio.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-gray-50 rounded-md border text-gray-400">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">Teléfono</p>
                          <p className="text-gray-900">{selectedSocio.telefono || "No registrado"}</p>
                        </div>
                      </div>
                      {selectedSocio.contactoEmergencia && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-gray-50 rounded-md border text-gray-400">
                            <Phone size={16} />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-medium">Contacto de emergencia</p>
                            <p className="text-gray-900">{selectedSocio.contactoEmergencia}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedSocio.categoria || selectedSocio.condicionMedica) && (
                    <div className="space-y-3">
                      {selectedSocio.categoria && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Categoría</p>
                          <p className="text-sm text-gray-900">{selectedSocio.categoria}</p>
                        </div>
                      )}
                      {selectedSocio.condicionMedica && (
                        <div className="p-4 border rounded-xl border-dashed">
                          <p className="text-xs text-gray-500 font-medium mb-1">Condición médica / alergias</p>
                          <p className="text-sm text-gray-700">{selectedSocio.condicionMedica}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSocio.comprobanteInscripcionUrl && (
                    <a
                      href={selectedSocio.comprobanteInscripcionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Paperclip size={16} /> Ver comprobante de inscripción
                    </a>
                  )}

                  {selectedSocio.grupoFamiliar && (
                    <div className="p-4 border rounded-xl border-dashed">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <UsersRound size={16} className="text-gray-400" /> Grupo Familiar
                      </h4>
                      <p className="text-sm text-gray-500">
                        Asociado a: <span className="font-medium text-gray-900">{selectedSocio.grupoFamiliar}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : socioTab === "historial" ? (
                <div className="space-y-4">
                  {pagosSocio.length > 0 ? (
                    pagosSocio.map((pago) => (
                      <div key={pago.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{pago.periodo}</p>
                          <p className="text-xs text-gray-500">
                            {pago.fecha} • {pago.metodo}
                          </p>
                        </div>
                        <span className="font-semibold text-sm text-gray-900">
                          $ {pago.monto.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-sm text-gray-500">No hay pagos registrados.</div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Asistencia (últimos registros)</p>
                      <p className="text-xl font-bold text-gray-900">{asistenciaPorcentaje}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium mb-1">Clases tomadas</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {asistenciaPresentes} de {asistenciaTotal} clases
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Últimos registros</h4>
                    <div className="space-y-2">
                      {asistenciasSocio.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">Sin registros de asistencia.</p>
                      ) : (
                        asistenciasSocio.map((registro) => (
                          <div
                            key={registro.id}
                            className="flex justify-between items-center p-3 border rounded-lg text-sm bg-white shadow-sm"
                          >
                            <span className="font-medium text-gray-700">{formatFecha(registro.fecha)}</span>
                            {registro.presente ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md">
                                <CheckCircle2 size={14} /> Presente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                                <X size={14} /> Ausente
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button
                onClick={() => setShowRegistrarPago(true)}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Registrar Pago
              </button>
            </div>
          </>
        )}
      </SideDrawer>

      <RegistrarPagoModal
        open={showRegistrarPago}
        onClose={() => setShowRegistrarPago(false)}
        socios={socios}
        initialSocio={selectedSocio}
      />

      {/* Modal Nuevo Socio */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold">Nuevo Socio</h3>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setForm(EMPTY_FORM);
                  setComprobanteFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="overflow-y-auto p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSocio();
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    value={form.nombreCompleto}
                    onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as SocioEstado }))}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">DNI *</label>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={form.dni}
                    onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
                  <input
                    type="email"
                    placeholder="juan@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono de contacto</label>
                  <input
                    type="text"
                    placeholder="11-2345-6789"
                    value={form.telefono}
                    onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="dd/mm/aaaa"
                      value={form.fechaNacimiento}
                      onChange={(e) => setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contacto de emergencia</label>
                  <input
                    type="text"
                    placeholder="Nombre y teléfono"
                    value={form.contactoEmergencia}
                    onChange={(e) => setForm((f) => ({ ...f, contactoEmergencia: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Menores, Juveniles..."
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    ¿Alguna condición médica o alergia que debamos conocer?
                  </label>
                  <textarea
                    rows={2}
                    value={form.condicionMedica}
                    onChange={(e) => setForm((f) => ({ ...f, condicionMedica: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Adjuntar comprobante de inscripción</label>
                  <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50 text-gray-700">
                    <Paperclip size={16} />
                    {comprobanteFile ? comprobanteFile.name : "Elegir archivo..."}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setComprobanteFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewModal(false);
                    setForm(EMPTY_FORM);
                    setComprobanteFile(null);
                  }}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Guardando..." : "Crear socio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
