"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Plus, Star, Trash2, Upload, X } from "lucide-react";
import {
  addTipoCuota,
  deleteTipoCuota,
  updateTipoCuota,
  useTiposCuota,
} from "@/lib/data/tiposCuota";
import { addSociosBatch } from "@/lib/data/socios";
import { DEFAULT_CONFIG, saveClubConfig, useClubConfig } from "@/lib/data/config";
import { downloadCsv, normalizeHeader, parseCsv, toCsv } from "@/lib/csv";
import { formatMonto, formatMontoInput, parseMontoInput } from "@/lib/format";
import type { ClubConfig, Socio, SocioEstado, TipoCuota } from "@/lib/types";

const PLANTILLA_HEADERS = [
  "Nombre Completo",
  "Estado",
  "Correo Electrónico",
  "Teléfono de contacto",
  "DNI",
  "Fecha de Nacimiento",
  "Contacto de Emergencia",
  "Categoría",
  "Condición médica o alergia",
];

const ESTADOS_VALIDOS: SocioEstado[] = ["Activo", "Pendiente", "Inactivo"];

interface FilaImportada {
  nombreCompleto: string;
  estado: SocioEstado;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;
  contactoEmergencia: string;
  categoria: string;
  condicionMedica: string;
}

function mapearFila(headers: string[], fila: string[]): FilaImportada {
  const get = (matcher: (h: string) => boolean) => {
    const idx = headers.findIndex(matcher);
    return idx === -1 ? "" : (fila[idx] ?? "").trim();
  };

  const estadoRaw = get((h) => h === "estado");
  const estado = ESTADOS_VALIDOS.includes(estadoRaw as SocioEstado)
    ? (estadoRaw as SocioEstado)
    : "Pendiente";

  return {
    nombreCompleto: get((h) => h === "nombre completo" || h === "nombre y apellido"),
    estado,
    email: get((h) => h.includes("correo") || h === "email"),
    telefono: get((h) => h.includes("telefono")),
    dni: get((h) => h === "dni"),
    fechaNacimiento: get((h) => h.includes("fecha de nacimiento")),
    contactoEmergencia: get((h) => h.includes("contacto de emergencia")),
    categoria: get((h) => h === "categoria"),
    condicionMedica: get((h) => h.includes("condicion") || h.includes("alergia")),
  };
}

export function ConfiguracionView() {
  const { config, loading: configLoading } = useClubConfig();
  const { data: tiposCuota, loading: tiposLoading } = useTiposCuota();

  const [form, setForm] = useState<ClubConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the form when Firestore pushes a new config
    setForm(config);
  }, [config]);

  const handleGuardar = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveClubConfig({
        nombreClub: form.nombreClub,
        emailContacto: form.emailContacto,
        telefono: form.telefono,
        diaVencimiento: Number(form.diaVencimiento) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEmails = async () => {
    await saveClubConfig({ enviarEmails: !config.enviarEmails });
  };

  // Modal de nuevo tipo de cuota / edición
  const [showNuevoTipo, setShowNuevoTipo] = useState(false);
  const [editingTipoId, setEditingTipoId] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [submittingTipo, setSubmittingTipo] = useState(false);

  const openNuevoTipoModal = () => {
    setEditingTipoId(null);
    setNuevoNombre("");
    setNuevoMonto("");
    setShowNuevoTipo(true);
  };

  const openEditarTipoModal = (cuota: TipoCuota) => {
    setEditingTipoId(cuota.id);
    setNuevoNombre(cuota.nombre);
    setNuevoMonto(formatMonto(cuota.monto));
    setShowNuevoTipo(true);
  };

  const closeNuevoTipoModal = () => {
    setShowNuevoTipo(false);
    setEditingTipoId(null);
    setNuevoNombre("");
    setNuevoMonto("");
  };

  const handleGuardarTipo = async () => {
    if (!nuevoNombre.trim()) return;
    setSubmittingTipo(true);
    try {
      const data = { nombre: nuevoNombre.trim(), monto: parseMontoInput(nuevoMonto) };
      if (editingTipoId) {
        await updateTipoCuota(editingTipoId, data);
      } else {
        await addTipoCuota({ ...data, porDefecto: false });
      }
      closeNuevoTipoModal();
    } finally {
      setSubmittingTipo(false);
    }
  };

  const handleMarcarDefecto = async (id: string) => {
    const otros = tiposCuota.filter((t) => t.porDefecto && t.id !== id);
    for (const otro of otros) {
      await updateTipoCuota(otro.id, { porDefecto: false });
    }
    await updateTipoCuota(id, { porDefecto: true });
  };

  const handleEliminarTipo = async (id: string) => {
    if (window.confirm("¿Seguro que querés eliminar este tipo de cuota?")) {
      await deleteTipoCuota(id);
    }
  };

  // Importar / exportar socios
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; errores: string[] } | null>(null);

  const handleDescargarPlantilla = () => {
    downloadCsv("plantilla-socios.csv", toCsv([PLANTILLA_HEADERS]));
  };

  const handleImportarClick = () => {
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        setImportResult({ ok: 0, errores: ["El archivo no tiene filas de datos para importar."] });
        return;
      }

      const headers = rows[0].map(normalizeHeader);
      const tipoCuotaPorDefecto = tiposCuota.find((t) => t.porDefecto) || tiposCuota[0];
      const errores: string[] = [];
      const nuevosSocios: Omit<Socio, "id" | "createdAt">[] = [];

      rows.slice(1).forEach((fila, index) => {
        const datos = mapearFila(headers, fila);
        const numeroFila = index + 2;
        if (!datos.nombreCompleto || !datos.dni || !datos.email) {
          errores.push(`Fila ${numeroFila}: falta Nombre Completo, DNI o Correo Electrónico.`);
          return;
        }
        nuevosSocios.push({
          nombreCompleto: datos.nombreCompleto,
          estado: datos.estado,
          email: datos.email,
          telefono: datos.telefono || undefined,
          dni: datos.dni,
          fechaNacimiento: datos.fechaNacimiento || undefined,
          contactoEmergencia: datos.contactoEmergencia || undefined,
          categoria: datos.categoria || undefined,
          condicionMedica: datos.condicionMedica || undefined,
          deuda: "Al día",
          grupoFamiliar: null,
          tipoCuotaId: tipoCuotaPorDefecto?.id || "",
        });
      });

      if (nuevosSocios.length > 0) {
        await addSociosBatch(nuevosSocios);
      }
      setImportResult({ ok: nuevosSocios.length, errores });
    } catch {
      setImportResult({ ok: 0, errores: ["No se pudo leer el archivo. Verificá que sea un CSV válido."] });
    } finally {
      setImporting(false);
    }
  };

  if (configLoading) {
    return <div className="px-4 lg:px-6 py-6 text-sm text-gray-500">Cargando configuración...</div>;
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-8">
      {/* Información del Club */}
      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Información del Club</h3>
          <p className="text-sm text-gray-500">Datos básicos de tu organización</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del club</label>
            <input
              type="text"
              value={form.nombreClub}
              onChange={(e) => setForm({ ...form, nombreClub: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email de contacto</label>
            <input
              type="email"
              value={form.emailContacto}
              onChange={(e) => setForm({ ...form, emailContacto: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="text"
              value={form.telefono ?? ""}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {saved && <span className="text-sm text-green-600">Cambios guardados</span>}
        </div>
      </div>

      {/* Tipos de Cuota */}
      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Tipos de Cuota</h3>
            <p className="text-sm text-gray-500">
              Definí los valores mensuales para distintas categorías de socios.
            </p>
          </div>
          <button
            onClick={openNuevoTipoModal}
            className="flex items-center gap-2 text-sm font-medium text-gray-900 border px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            <Plus size={16} /> Nuevo tipo
          </button>
        </div>

        <div className="border rounded-lg divide-y">
          {tiposLoading ? (
            <div className="p-4 text-sm text-gray-500">Cargando tipos de cuota...</div>
          ) : tiposCuota.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Todavía no hay tipos de cuota creados.</div>
          ) : (
            tiposCuota.map((cuota) => (
              <div
                key={cuota.id}
                onClick={() => openEditarTipoModal(cuota)}
                className="flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{cuota.nombre}</span>
                    {cuota.porDefecto && (
                      <span className="text-[10px] bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-medium">
                        Por defecto
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">$ {formatMonto(cuota.monto)} / mes</span>
                </div>
                <div className="flex items-center gap-1">
                  {!cuota.porDefecto && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarcarDefecto(cuota.id);
                      }}
                      title="Marcar como tipo por defecto"
                      className="p-1.5 text-gray-400 hover:text-gray-900"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarTipo(cuota.id);
                    }}
                    title="Eliminar tipo de cuota"
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium mb-1">Día de vencimiento general</label>
          <input
            type="number"
            value={form.diaVencimiento}
            onChange={(e) => setForm({ ...form, diaVencimiento: Number(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            Día del mes en que vence el pago de todas las cuotas.
          </p>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Notificaciones</h3>
          <p className="text-sm text-gray-500">Configura las comunicaciones automáticas con tus socios</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Enviar emails a socios</p>
            <p className="text-xs text-gray-500 max-w-md">
              Si lo desactivás, no se enviarán comprobantes, recordatorios, notas de crédito ni
              invitaciones a tus socios. Útil para probar el sistema sin notificar.
            </p>
          </div>
          <button
            onClick={handleToggleEmails}
            aria-pressed={config.enviarEmails}
            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
              config.enviarEmails ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                config.enviarEmails ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Base de Datos */}
      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Base de Datos</h3>
          <p className="text-sm text-gray-500">
            Migra tu lista de socios desde Excel u otra plataforma de gestión.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleArchivoSeleccionado}
          />
          <button
            onClick={handleImportarClick}
            disabled={importing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} /> {importing ? "Importando..." : "Importar socios (CSV)"}
          </button>
          <button
            onClick={handleDescargarPlantilla}
            className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} /> Descargar plantilla
          </button>
        </div>

        {importResult && (
          <div
            className={`text-sm rounded-md border p-3 ${
              importResult.errores.length > 0
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <p>
              Se importaron <span className="font-medium">{importResult.ok}</span> socios.
            </p>
            {importResult.errores.length > 0 && (
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {importResult.errores.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Acerca de */}
      <p className="text-xs text-gray-400 text-center">Canotaje Córdoba · v1.0.0</p>

      {/* Modal de Nuevo Tipo de Cuota */}
      {showNuevoTipo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {editingTipoId ? "Editar tipo de cuota" : "Nuevo tipo de cuota"}
              </h3>
              <button onClick={closeNuevoTipoModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Estándar, Familiar, Menor..."
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monto mensual</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={nuevoMonto}
                    onChange={(e) => setNuevoMonto(formatMontoInput(e.target.value))}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
              {editingTipoId && (
                <p className="text-xs text-gray-500">
                  Para marcarlo como tipo por defecto, usá la estrella en la lista.
                </p>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeNuevoTipoModal}
                className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarTipo}
                disabled={!nuevoNombre.trim() || submittingTipo}
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
