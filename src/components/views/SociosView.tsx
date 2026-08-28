"use client";

import { useMemo, useState } from "react";
import { orderBy, where } from "firebase/firestore";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  Mail,
  Phone,
  Plus,
  Search,
  Share2,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { SideDrawer } from "@/components/layout/SideDrawer";
import { useCollection } from "@/lib/data/useCollection";
import { addSocio, useSocios } from "@/lib/data/socios";
import { useTiposCuota } from "@/lib/data/tiposCuota";
import { useAsistenciasPorFecha, useAsistenciasPorSocio, toggleAsistencia } from "@/lib/data/asistencias";
import { useClubConfig } from "@/lib/data/config";
import type { Pago, Socio } from "@/lib/types";

type SocioTab = "perfil" | "historial" | "asistencia";

const EMPTY_FORM = {
  email: "",
  dni: "",
  nombre: "",
  apellido: "",
  telefono: "",
  fechaNacimiento: "",
  grupoFamiliar: "",
  tipoCuotaId: "",
};

function initials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split("-");
  if (!y || !m || !d) return fecha;
  return `${d}/${m}/${y}`;
}

export function SociosView() {
  const { data: socios, loading } = useSocios();
  const { data: tiposCuota } = useTiposCuota();
  const { config } = useClubConfig();

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [socioTab, setSocioTab] = useState<SocioTab>("perfil");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const toggleAttendance = async (socioId: string) => {
    const current = attendanceMap[socioId] ?? false;
    await toggleAsistencia(socioId, attendanceDate, !current);
  };

  const filteredSocios = socios.filter((socio) => {
    const term = searchTerm.toLowerCase();
    return (
      `${socio.nombre} ${socio.apellido}`.toLowerCase().includes(term) ||
      socio.dni.includes(searchTerm) ||
      socio.email.toLowerCase().includes(term)
    );
  });

  const formUrl = config.formularioInscripcionUrl;

  const handleCopyLink = async () => {
    if (!formUrl) return;
    try {
      await navigator.clipboard.writeText(formUrl);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch {
      // Si el navegador rechaza el acceso al portapapeles no hacemos nada más.
    }
  };

  const handleCreateSocio = async () => {
    if (!form.nombre || !form.apellido || !form.email || !form.dni) return;
    await addSocio({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      dni: form.dni,
      telefono: form.telefono || undefined,
      fechaNacimiento: form.fechaNacimiento || undefined,
      estado: "Pendiente",
      deuda: "Al día",
      grupoFamiliar: form.grupoFamiliar || null,
      tipoCuotaId: form.tipoCuotaId || tipoCuotaPorDefecto?.id || "",
    });
    setForm(EMPTY_FORM);
    setShowNewModal(false);
  };

  const asistenciaTotal = asistenciasSocio.length;
  const asistenciaPresentes = asistenciasSocio.filter((a) => a.presente).length;
  const asistenciaPorcentaje =
    asistenciaTotal > 0 ? Math.round((asistenciaPresentes / asistenciaTotal) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {!showNewModal ? (
        <>
          {/* Cabecera / Toolbar dinámico */}
          {isTakingAttendance ? (
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
                onClick={() => {
                  setIsTakingAttendance(false);
                  setSearchTerm("");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 shrink-0"
              >
                <X size={16} /> Finalizar
              </button>
            </div>
          ) : (
            <>
              {/* Toolbar Normal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-gray-500">
                  {loading ? "Cargando..." : `${socios.length} socios registrados`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsTakingAttendance(true)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
                  >
                    <CheckCircle2 size={16} /> Asistencia
                  </button>
                  <button
                    onClick={handleCopyLink}
                    disabled={!formUrl}
                    title={!formUrl ? "Configurá el link del formulario en Configuración" : undefined}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      isLinkCopied
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "hover:bg-gray-50 text-gray-700"
                    } ${!formUrl ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLinkCopied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                    {isLinkCopied ? "¡Copiado!" : "Compartir"}
                  </button>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                  >
                    <Plus size={16} /> Nuevo socio
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1 max-w-md">
                  <label className="block text-xs text-gray-500 mb-1">Buscar</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nombre, DNI o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <label className="block text-xs text-gray-500 mb-1">Estado</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900">
                    <option>Todos</option>
                    <option>Activos</option>
                    <option>Pendientes</option>
                  </select>
                </div>
                <div className="w-48">
                  <label className="block text-xs text-gray-500 mb-1">Cuota del mes</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900">
                    <option>Todas</option>
                    <option>Al día</option>
                    <option>Deuda</option>
                  </select>
                </div>
                <button className="p-2 border rounded-md hover:bg-gray-50 text-gray-600">
                  <Download size={18} />
                </button>
              </div>
            </>
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
                    <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                    <th className="px-6 py-3 font-medium text-gray-500">DNI</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Tipo de Cuota</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Grupo Familiar</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Estado</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Mes Actual</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={isTakingAttendance ? 3 : 6} className="text-center py-10 text-gray-500 text-sm">
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                {initials(socio.nombre, socio.apellido)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {socio.nombre} {socio.apellido}
                                </p>
                                <p className="text-xs text-gray-500">{socio.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{socio.dni}</td>

                          {isTakingAttendance ? (
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
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                                  {tiposCuota.find((c) => c.id === socio.tipoCuotaId)?.nombre || "Estándar"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {socio.grupoFamiliar ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium border">
                                    <UsersRound size={12} className="text-gray-500" /> {socio.grupoFamiliar}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                    socio.estado === "Activo"
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  }`}
                                >
                                  {socio.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                    socio.deuda === "Admin"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : socio.deuda === "Al día"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                                >
                                  {socio.deuda}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                    {filteredSocios.length === 0 && (
                      <tr>
                        <td colSpan={isTakingAttendance ? 3 : 6} className="text-center py-10 text-gray-500 text-sm">
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
                {/* Drawer Header */}
                <div className="flex justify-between items-start p-6 border-b bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-lg font-medium text-gray-600">
                      {initials(selectedSocio.nombre, selectedSocio.apellido)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {selectedSocio.nombre} {selectedSocio.apellido}
                      </h3>
                      <p className="text-sm text-gray-500">DNI: {selectedSocio.dni}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSocio(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Tabs */}
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

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {socioTab === "perfil" ? (
                    <div className="space-y-6">
                      {/* Estado Info */}
                      <div className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Estado de cuenta</p>
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                              selectedSocio.deuda === "Admin"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : selectedSocio.deuda === "Al día"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {selectedSocio.deuda}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium mb-1">Tipo de cuota</p>
                          <span className="font-medium text-gray-900">
                            {tiposCuota.find((c) => c.id === selectedSocio.tipoCuotaId)?.nombre || "Estándar"}
                          </span>
                        </div>
                      </div>

                      {/* Contacto */}
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
                        </div>
                      </div>

                      {/* Grupo Familiar */}
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
                      {/* Resumen de asistencia */}
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

                      {/* Lista de últimas asistencias */}
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
                {/* Drawer Footer Actions */}
                <div className="p-4 border-t bg-gray-50 flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                    Registrar Pago
                  </button>
                </div>
              </>
            )}
          </SideDrawer>
        </>
      ) : (
        /* Formulario Nuevo Socio */
        <div className="max-w-2xl bg-white border rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Nuevo Socio</h3>
            <button
              onClick={() => {
                setShowNewModal(false);
                setForm(EMPTY_FORM);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSocio();
            }}
          >
            {/* Foto */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl font-medium">
                ?
              </div>
              <div>
                <button type="button" className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-gray-50">
                  <Upload size={14} /> Subir foto
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG. Máx 2MB.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido *</label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    value={form.apellido}
                    onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  type="text"
                  placeholder="11-2345-6789"
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
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
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Grupo Familiar (Opcional)</label>
                <div className="relative">
                  <UsersRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ej: Familia Pérez"
                    value={form.grupoFamiliar}
                    onChange={(e) => setForm((f) => ({ ...f, grupoFamiliar: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Asocia a este socio con otros miembros para unificar cobros.</p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CreditCard size={14} /> Configuración de Cuota
              </h4>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de cuota mensual</label>
                <select
                  value={form.tipoCuotaId || tipoCuotaPorDefecto?.id || ""}
                  onChange={(e) => setForm((f) => ({ ...f, tipoCuotaId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  {tiposCuota.map((cuota) => (
                    <option key={cuota.id} value={cuota.id}>
                      {cuota.nombre} - ${cuota.monto}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Puedes configurar los tipos de cuota desde Configuración.</p>
              </div>

              <div className="p-4 border rounded-md bg-gray-50">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 rounded text-gray-900" />
                  <div>
                    <span className="text-sm font-medium">¿Posee saldo a favor o deuda inicial?</span>
                    <p className="text-xs text-gray-500">Marcá esta opción si necesitas ajustar el saldo al darlo de alta.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewModal(false);
                  setForm(EMPTY_FORM);
                }}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                Crear socio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
