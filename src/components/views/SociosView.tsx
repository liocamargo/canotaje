"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { orderBy, where } from "firebase/firestore";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  Edit2,
  Mail,
  Paperclip,
  Phone,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { SideDrawer } from "@/components/layout/SideDrawer";
import type { OnBreadcrumbChange } from "@/components/layout/breadcrumb";
import { useCollection } from "@/lib/data/useCollection";
import { addSocio, deleteSocio, updateSocio, useSocios } from "@/lib/data/socios";
import { addPagosBatch } from "@/lib/data/pagos";
import { useTiposCuota } from "@/lib/data/tiposCuota";
import { useGrupos } from "@/lib/data/grupos";
import { useAsistenciasPorFecha, useAsistenciasPorSocio, toggleAsistencia } from "@/lib/data/asistencias";
import { uploadArchivoSocio, type SocioDocTipo } from "@/lib/storage";
import { downloadCsv, toCsv } from "@/lib/csv";
import { getFechaHoy, getPeriodoActual } from "@/lib/format";
import type { MetodoPago, Pago, Socio, SocioDeuda, SocioEstado } from "@/lib/types";

type SocioTab = "datos" | "asistencia" | "historial";
type ColumnKey = "nombre" | "email" | "dni" | "telefono" | "tipoCuota" | "grupo";
type TableMode = "normal" | "asistencia" | "pago";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  nombre: "Nombre",
  email: "Email",
  dni: "DNI",
  telefono: "Teléfono",
  tipoCuota: "Tipo de cuota",
  grupo: "Grupo",
};
const COLUMN_KEYS: ColumnKey[] = ["nombre", "email", "dni", "telefono", "tipoCuota", "grupo"];
const COLUMNS_STORAGE_KEY = "canotaje:sociosColumnas";
const PAGE_SIZE = 14;
const METODOS: MetodoPago[] = ["Efectivo", "Transferencia", "Tarjeta"];

const ESTADOS: SocioEstado[] = ["Activo", "Pendiente", "Inactivo"];

const EMPTY_FORM = {
  nombreCompleto: "",
  estado: "Pendiente" as SocioEstado,
  email: "",
  telefono: "",
  dni: "",
  fechaNacimiento: "",
  contactoEmergencia: "",
  grupoId: "",
  grupoSanguineo: "",
  obraSocial: "",
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

function DocumentoRow({
  label,
  url,
  uploading,
  onUpload,
}: {
  label: string;
  url?: string;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
      <div className="flex items-center gap-2">
        {url ? (
          <CheckCircle2 size={16} className="text-green-600" />
        ) : (
          <AlertCircle size={16} className="text-gray-400" />
        )}
        <span className={url ? "text-gray-900" : "text-gray-500"}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver
          </a>
        )}
        <label className="text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
          {uploading ? "Subiendo..." : url ? "Reemplazar" : "Adjuntar"}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
    </div>
  );
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
  const { data: grupos } = useGrupos();

  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSocioId, setEditingSocioId] = useState<string | null>(null);
  const [selectedSocioId, setSelectedSocioId] = useState<string | null>(null);
  const selectedSocio = socios.find((s) => s.id === selectedSocioId) ?? null;
  const [socioTab, setSocioTab] = useState<SocioTab>("datos");
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | SocioEstado>("todos");
  const [deudaFilter, setDeudaFilter] = useState<"todas" | SocioDeuda>("todas");
  const [grupoFilter, setGrupoFilter] = useState<"todos" | "sin-grupo" | string>("todos");
  const [form, setForm] = useState(EMPTY_FORM);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [showColumnasMenu, setShowColumnasMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    nombre: true,
    email: true,
    dni: true,
    telefono: true,
    tipoCuota: true,
    grupo: true,
  });
  const [page, setPage] = useState(1);

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

  // --- Registrar pago (pantalla completa, igual que asistencia) ---
  const [isRegisteringPago, setIsRegisteringPago] = useState(false);
  const [pagoSeleccionados, setPagoSeleccionados] = useState<Set<string>>(new Set());
  const [pagoMonto, setPagoMonto] = useState("15000");
  const [pagoMetodo, setPagoMetodo] = useState<MetodoPago>("Efectivo");
  const [confirmandoPagos, setConfirmandoPagos] = useState(false);

  const tableMode: TableMode = isTakingAttendance ? "asistencia" : isRegisteringPago ? "pago" : "normal";

  // --- Pagos e historial de asistencia del socio seleccionado ---
  const { data: pagosSocio } = useCollection<Pago>(
    "pagos",
    selectedSocio
      ? [where("socioId", "==", selectedSocio.id), orderBy("fecha", "desc")]
      : []
  );
  const { data: asistenciasSocio } = useAsistenciasPorSocio(selectedSocio?.id ?? "");

  const tipoCuotaPorDefecto = tiposCuota.find((c) => c.porDefecto) || tiposCuota[0];
  const grupoPorDefecto = grupos.find((g) => g.porDefecto) || null;

  const finalizarAsistencia = () => {
    setIsTakingAttendance(false);
    setSearchTerm("");
  };

  const cancelarRegistroPago = () => {
    setIsRegisteringPago(false);
    setSearchTerm("");
    setPagoSeleccionados(new Set());
  };

  useImperativeHandle(ref, () => ({
    abrirNuevoSocio: () => {
      setEditingSocioId(null);
      setForm({ ...EMPTY_FORM, grupoId: grupoPorDefecto?.id ?? "" });
      setComprobanteFile(null);
      setShowNewModal(true);
    },
    abrirRegistrarPago: () => {
      setIsTakingAttendance(false);
      setIsRegisteringPago(true);
      setSearchTerm("");
      setPagoSeleccionados(new Set());
      setPagoMonto("15000");
      setPagoMetodo("Efectivo");
    },
    activarAsistencia: () => {
      setIsRegisteringPago(false);
      setIsTakingAttendance(true);
    },
  }));

  useEffect(() => {
    if (isTakingAttendance) {
      onBreadcrumbChange?.({ label: "Asistencia", onReset: finalizarAsistencia });
    } else if (isRegisteringPago) {
      onBreadcrumbChange?.({ label: "Registrar Pago", onReset: cancelarRegistroPago });
    } else {
      onBreadcrumbChange?.(null);
    }
    return () => onBreadcrumbChange?.(null);
  }, [isTakingAttendance, isRegisteringPago, onBreadcrumbChange]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restaura la preferencia guardada del navegador al montar
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

  const togglePagoSeleccion = (socioId: string) => {
    setPagoSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(socioId)) next.delete(socioId);
      else next.add(socioId);
      return next;
    });
  };

  const handleConfirmarPagos = async () => {
    if (pagoSeleccionados.size === 0) return;
    setConfirmandoPagos(true);
    try {
      const periodoActual = getPeriodoActual();
      const fecha = getFechaHoy();
      const montoNum = Number(pagoMonto) || 0;
      const seleccionados = socios.filter((s) => pagoSeleccionados.has(s.id));
      await addPagosBatch(
        seleccionados.map((s) => ({
          socioId: s.id,
          socio: s.nombreCompleto,
          periodo: periodoActual,
          fecha,
          metodo: pagoMetodo,
          monto: montoNum,
        }))
      );
      cancelarRegistroPago();
    } finally {
      setConfirmandoPagos(false);
    }
  };

  const filteredSocios = socios.filter((socio) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      socio.nombreCompleto.toLowerCase().includes(term) ||
      socio.dni.includes(searchTerm) ||
      socio.email.toLowerCase().includes(term);
    const matchesEstado = estadoFilter === "todos" || socio.estado === estadoFilter;
    const matchesDeuda = deudaFilter === "todas" || socio.deuda === deudaFilter;
    const matchesGrupo =
      grupoFilter === "todos" ||
      (grupoFilter === "sin-grupo" ? !socio.grupoId : socio.grupoId === grupoFilter);
    return matchesSearch && matchesEstado && matchesDeuda && matchesGrupo;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- volver a la página 1 cuando cambian los filtros
    setPage(1);
  }, [searchTerm, estadoFilter, deudaFilter, grupoFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSocios.length / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPages);
  const paginatedSocios = filteredSocios.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const handleExportar = () => {
    const columns = COLUMN_KEYS.filter((c) => visibleColumns[c]);
    const header = columns.map((c) => COLUMN_LABELS[c]);
    const rows = filteredSocios.map((s) =>
      columns.map((c) => {
        if (c === "nombre") return s.nombreCompleto;
        if (c === "email") return s.email;
        if (c === "dni") return s.dni;
        if (c === "telefono") return s.telefono ?? "";
        if (c === "grupo") return grupos.find((g) => g.id === s.grupoId)?.nombre ?? "";
        return tiposCuota.find((t) => t.id === s.tipoCuotaId)?.nombre ?? "";
      })
    );
    downloadCsv(`socios-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]));
  };

  const abrirEditarSocio = (socio: Socio) => {
    setEditingSocioId(socio.id);
    setForm({
      nombreCompleto: socio.nombreCompleto,
      estado: socio.estado,
      email: socio.email,
      telefono: socio.telefono ?? "",
      dni: socio.dni,
      fechaNacimiento: socio.fechaNacimiento ?? "",
      contactoEmergencia: socio.contactoEmergencia ?? "",
      grupoId: socio.grupoId ?? "",
      grupoSanguineo: socio.grupoSanguineo ?? "",
      obraSocial: socio.obraSocial ?? "",
      condicionMedica: socio.condicionMedica ?? "",
    });
    setComprobanteFile(null);
    setShowNewModal(true);
  };

  const cerrarModalSocio = () => {
    setShowNewModal(false);
    setEditingSocioId(null);
    setForm(EMPTY_FORM);
    setComprobanteFile(null);
  };

  const handleGuardarSocio = async () => {
    if (!form.nombreCompleto || !form.dni || !form.email) return;
    setSubmitting(true);
    try {
      let comprobanteInscripcionUrl: string | undefined;
      if (comprobanteFile) {
        comprobanteInscripcionUrl = await uploadArchivoSocio("comprobantes", form.dni, comprobanteFile);
      }
      const datosComunes = {
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        dni: form.dni,
        telefono: form.telefono || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        contactoEmergencia: form.contactoEmergencia || undefined,
        grupoId: form.grupoId || null,
        grupoSanguineo: form.grupoSanguineo || undefined,
        obraSocial: form.obraSocial || undefined,
        condicionMedica: form.condicionMedica || undefined,
        estado: form.estado,
      };
      if (editingSocioId) {
        await updateSocio(editingSocioId, {
          ...datosComunes,
          ...(comprobanteInscripcionUrl ? { comprobanteInscripcionUrl } : {}),
        });
      } else {
        await addSocio({
          ...datosComunes,
          comprobanteInscripcionUrl,
          deuda: "Al día",
          grupoFamiliar: null,
          tipoCuotaId: tipoCuotaPorDefecto?.id || "",
        });
      }
      cerrarModalSocio();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarSocio = async (socio: Socio) => {
    if (!window.confirm(`¿Eliminar a ${socio.nombreCompleto}? Esta acción no se puede deshacer.`)) {
      return;
    }
    await deleteSocio(socio.id);
    setSelectedSocioId(null);
  };

  const handleUploadDocumento = async (
    campo: "fichaMedicaUrl" | "deslindeResponsabilidadUrl" | "comprobanteInscripcionUrl",
    tipo: SocioDocTipo,
    file: File
  ) => {
    if (!selectedSocio) return;
    setUploadingDoc(campo);
    try {
      const url = await uploadArchivoSocio(tipo, selectedSocio.dni, file);
      await updateSocio(selectedSocio.id, { [campo]: url });
    } finally {
      setUploadingDoc(null);
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
      {tableMode === "asistencia" && (
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

      {/* Cabecera de registrar pago (misma mecánica que asistencia) */}
      {tableMode === "pago" && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gray-900 p-4 rounded-xl shadow-sm text-white">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div>
              <h3 className="font-semibold text-lg">Registrar Pago</h3>
              <p className="text-xs text-gray-300">Seleccioná a los socios que pagaron y confirmá.</p>
            </div>
            <div className="h-8 w-px bg-gray-700 mx-2 hidden sm:block"></div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm w-28 focus:outline-none focus:ring-1 focus:ring-gray-500 text-white"
              />
            </div>
            <div className="flex gap-1">
              {METODOS.map((m) => (
                <button
                  key={m}
                  onClick={() => setPagoMetodo(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                    pagoMetodo === m ? "bg-white text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar socio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleConfirmarPagos}
              disabled={pagoSeleccionados.size === 0 || confirmandoPagos}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirmandoPagos
                ? "Registrando..."
                : `Registrar ${pagoSeleccionados.size || ""} pago${pagoSeleccionados.size === 1 ? "" : "s"}`}
            </button>
            <button
              onClick={cancelarRegistroPago}
              className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white rounded-md text-sm font-medium hover:bg-white/10"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {tableMode === "normal" && (
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
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1">Grupo</label>
              <select
                value={grupoFilter}
                onChange={(e) => setGrupoFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="todos">Todos</option>
                <option value="sin-grupo">Sin grupo</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
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
              title="Exportar"
              className="p-2 border rounded-md hover:bg-gray-50 text-gray-700"
            >
              <Download size={16} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowColumnasMenu((o) => !o)}
                title="Columnas"
                className="p-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                <Columns3 size={16} />
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
            {tableMode === "asistencia" ? (
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                <th className="px-6 py-3 font-medium text-gray-500">DNI</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-right">Estado de Asistencia</th>
              </tr>
            ) : tableMode === "pago" ? (
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                <th className="px-6 py-3 font-medium text-gray-500">DNI</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-right">Seleccionado</th>
              </tr>
            ) : (
              <tr>
                {visibleColumns.nombre && <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>}
                {visibleColumns.email && <th className="px-6 py-3 font-medium text-gray-500">Email</th>}
                {visibleColumns.dni && <th className="px-6 py-3 font-medium text-gray-500">DNI</th>}
                {visibleColumns.telefono && <th className="px-6 py-3 font-medium text-gray-500">Teléfono</th>}
                {visibleColumns.tipoCuota && (
                  <th className="px-6 py-3 font-medium text-gray-500">Tipo de cuota</th>
                )}
                {visibleColumns.grupo && <th className="px-6 py-3 font-medium text-gray-500">Grupo</th>}
              </tr>
            )}
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={tableMode !== "normal" ? 3 : visibleColumnCount}
                  className="text-center py-10 text-gray-500 text-sm"
                >
                  Cargando socios...
                </td>
              </tr>
            ) : (
              <>
                {paginatedSocios.map((socio) => {
                  const isPresent = attendanceMap[socio.id] ?? false;
                  const isSeleccionadoPago = pagoSeleccionados.has(socio.id);
                  const highlighted = tableMode === "asistencia" ? isPresent : isSeleccionadoPago;

                  return (
                    <tr
                      key={socio.id}
                      className={`transition-colors ${
                        tableMode !== "normal"
                          ? highlighted
                            ? "bg-green-50/30"
                            : "hover:bg-gray-50"
                          : "hover:bg-gray-50 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (tableMode === "normal") {
                          setSelectedSocioId(socio.id);
                          setSocioTab("datos");
                        }
                      }}
                    >
                      {tableMode === "asistencia" ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{socio.nombreCompleto}</p>
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
                      ) : tableMode === "pago" ? (
                        <>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{socio.nombreCompleto}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{socio.dni}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePagoSeleccion(socio.id);
                              }}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                isSeleccionadoPago
                                  ? "bg-green-100 text-green-700 border border-green-200 shadow-sm"
                                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              <CheckCircle2
                                size={16}
                                className={isSeleccionadoPago ? "text-green-600" : "text-gray-400"}
                              />
                              {isSeleccionadoPago ? "Seleccionado" : "Seleccionar"}
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {visibleColumns.nombre && (
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{socio.nombreCompleto}</p>
                            </td>
                          )}
                          {visibleColumns.email && (
                            <td className="px-6 py-4 text-gray-600">{socio.email}</td>
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
                          {visibleColumns.grupo && (
                            <td className="px-6 py-4 text-gray-600">
                              {grupos.find((g) => g.id === socio.grupoId)?.nombre || "—"}
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
                      colSpan={tableMode !== "normal" ? 3 : visibleColumnCount}
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

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Página {paginaActual} de {totalPages} · {filteredSocios.length} socios
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="p-2 border rounded-md hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={paginaActual === totalPages}
              className="p-2 border rounded-md hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Drawer: Detalle del Socio */}
      <SideDrawer isOpen={!!selectedSocio} onClose={() => setSelectedSocioId(null)}>
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
              <button onClick={() => setSelectedSocioId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex px-6 border-b overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSocioTab("datos")}
                className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${
                  socioTab === "datos" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Datos
              </button>
              <button
                onClick={() => setSocioTab("asistencia")}
                className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${
                  socioTab === "asistencia" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Asistencia
              </button>
              <button
                onClick={() => setSocioTab("historial")}
                className={`py-3 text-sm font-medium border-b-2 shrink-0 ${
                  socioTab === "historial" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pagos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {socioTab === "datos" ? (
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

                  {selectedSocio.grupoId && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Grupo</p>
                      <p className="text-sm text-gray-900">
                        {grupos.find((g) => g.id === selectedSocio.grupoId)?.nombre || "—"}
                      </p>
                    </div>
                  )}

                  {(selectedSocio.grupoSanguineo || selectedSocio.obraSocial || selectedSocio.condicionMedica) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Salud</h4>
                      <div className="space-y-3">
                        {selectedSocio.grupoSanguineo && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Grupo sanguíneo</p>
                            <p className="text-sm text-gray-900">{selectedSocio.grupoSanguineo}</p>
                          </div>
                        )}
                        {selectedSocio.obraSocial && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Obra social</p>
                            <p className="text-sm text-gray-900">{selectedSocio.obraSocial}</p>
                          </div>
                        )}
                        {selectedSocio.condicionMedica && (
                          <div className="p-4 border rounded-xl border-dashed">
                            <p className="text-xs text-gray-500 font-medium mb-1">Condición médica / alergias</p>
                            <p className="text-sm text-gray-700">{selectedSocio.condicionMedica}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Documentación</h4>
                    <div className="space-y-2">
                      <DocumentoRow
                        label="Comprobante de inscripción"
                        url={selectedSocio.comprobanteInscripcionUrl}
                        uploading={uploadingDoc === "comprobanteInscripcionUrl"}
                        onUpload={(file) =>
                          handleUploadDocumento("comprobanteInscripcionUrl", "comprobantes", file)
                        }
                      />
                      <DocumentoRow
                        label="Ficha médica"
                        url={selectedSocio.fichaMedicaUrl}
                        uploading={uploadingDoc === "fichaMedicaUrl"}
                        onUpload={(file) =>
                          handleUploadDocumento("fichaMedicaUrl", "fichas-medicas", file)
                        }
                      />
                      <DocumentoRow
                        label="Deslinde de responsabilidad"
                        url={selectedSocio.deslindeResponsabilidadUrl}
                        uploading={uploadingDoc === "deslindeResponsabilidadUrl"}
                        onUpload={(file) =>
                          handleUploadDocumento("deslindeResponsabilidadUrl", "deslindes", file)
                        }
                      />
                    </div>
                  </div>

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
              ) : socioTab === "asistencia" ? (
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
              ) : (
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
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button
                onClick={() => abrirEditarSocio(selectedSocio)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                <Edit2 size={16} /> Editar
              </button>
              <button
                onClick={() => handleEliminarSocio(selectedSocio)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </>
        )}
      </SideDrawer>

      {/* Modal Nuevo/Editar Socio */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold">{editingSocioId ? "Editar Socio" : "Nuevo Socio"}</h3>
              <button onClick={cerrarModalSocio} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form
              className="overflow-y-auto p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardarSocio();
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
                  <label className="block text-sm font-medium mb-1">Grupo</label>
                  <select
                    value={form.grupoId}
                    onChange={(e) => setForm((f) => ({ ...f, grupoId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Sin grupo</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Grupo sanguíneo</label>
                  <input
                    type="text"
                    placeholder="Ej: O+"
                    value={form.grupoSanguineo}
                    onChange={(e) => setForm((f) => ({ ...f, grupoSanguineo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Obra social</label>
                  <input
                    type="text"
                    placeholder="Ej: OSDE, IAPOS..."
                    value={form.obraSocial}
                    onChange={(e) => setForm((f) => ({ ...f, obraSocial: e.target.value }))}
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
                  onClick={cerrarModalSocio}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Guardando..." : editingSocioId ? "Guardar cambios" : "Crear socio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
