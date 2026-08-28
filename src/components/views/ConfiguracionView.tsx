"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Download,
  Plus,
  Settings,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  addTipoCuota,
  deleteTipoCuota,
  updateTipoCuota,
  useTiposCuota,
} from "@/lib/data/tiposCuota";
import { DEFAULT_CONFIG, saveClubConfig, useClubConfig } from "@/lib/data/config";
import type { ClubConfig } from "@/lib/types";

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
        formularioInscripcionUrl: form.formularioInscripcionUrl,
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

  // Modal de nuevo tipo de cuota
  const [showNuevoTipo, setShowNuevoTipo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoPorDefecto, setNuevoPorDefecto] = useState(false);
  const [submittingTipo, setSubmittingTipo] = useState(false);

  const closeNuevoTipoModal = () => {
    setShowNuevoTipo(false);
    setNuevoNombre("");
    setNuevoMonto("");
    setNuevoPorDefecto(false);
  };

  const handleGuardarTipo = async () => {
    if (!nuevoNombre.trim()) return;
    setSubmittingTipo(true);
    try {
      if (nuevoPorDefecto) {
        const otros = tiposCuota.filter((t) => t.porDefecto);
        for (const otro of otros) {
          await updateTipoCuota(otro.id, { porDefecto: false });
        }
      }
      await addTipoCuota({
        nombre: nuevoNombre.trim(),
        monto: Number(nuevoMonto) || 0,
        porDefecto: nuevoPorDefecto,
      });
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

  if (configLoading) {
    return <div className="p-8 text-sm text-gray-500">Cargando configuración...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex gap-2 border-b mb-6">
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900 flex items-center gap-2">
          <Settings size={16} /> General
        </button>
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2">
          <CreditCard size={16} /> Pagos y Cuotas
        </button>
      </div>

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
          <div>
            <label className="block text-sm font-medium mb-1">
              URL del formulario de inscripción
            </label>
            <input
              type="text"
              placeholder="https://forms.gle/..."
              value={form.formularioInscripcionUrl ?? ""}
              onChange={(e) => setForm({ ...form, formularioInscripcionUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se usa en el botón &quot;Compartir&quot; de la vista de Socios para enlazar a un formulario externo (por ejemplo, Google Forms).
            </p>
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
            onClick={() => setShowNuevoTipo(true)}
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
              <div key={cuota.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{cuota.nombre}</span>
                    {cuota.porDefecto && (
                      <span className="text-[10px] bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-medium">
                        Por defecto
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">${cuota.monto} / mes</span>
                </div>
                <div className="flex items-center gap-1">
                  {!cuota.porDefecto && (
                    <button
                      onClick={() => handleMarcarDefecto(cuota.id)}
                      title="Marcar como tipo por defecto"
                      className="p-1.5 text-gray-400 hover:text-gray-900"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminarTipo(cuota.id)}
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
            className="w-full max-w-[150px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
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

        <div className="pt-4 border-t flex items-center justify-between opacity-60">
          <div>
            <p className="text-sm font-medium text-gray-900">Recordatorios por WhatsApp</p>
            <p className="text-xs text-gray-500">Notificaciones automáticas vía WhatsApp</p>
          </div>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 border text-xs rounded-md font-medium">
            Próximamente
          </span>
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
          <button
            disabled
            title="Próximamente"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
          >
            <Upload size={16} /> Importar socios (CSV)
          </button>
          <button
            disabled
            title="Próximamente"
            className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed"
          >
            <Download size={16} /> Descargar plantilla
          </button>
        </div>
      </div>

      {/* Acerca de */}
      <p className="text-xs text-gray-400 text-center">Canotaje Córdoba · v1.0.0</p>

      {/* Modal de Nuevo Tipo de Cuota */}
      {showNuevoTipo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Nuevo tipo de cuota</h3>
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
                <input
                  type="number"
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={nuevoPorDefecto}
                  onChange={(e) => setNuevoPorDefecto(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Marcar como tipo por defecto
              </label>
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
