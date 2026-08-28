"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, Paperclip, Waves } from "lucide-react";
import { db } from "@/lib/firebase";
import { useGrupos } from "@/lib/data/grupos";
import { useTiposCuota } from "@/lib/data/tiposCuota";
import { uploadArchivoSocio } from "@/lib/storage";

const EMPTY_FORM = {
  nombreCompleto: "",
  dni: "",
  email: "",
  telefono: "",
  fechaNacimiento: "",
  contactoEmergencia: "",
  grupoId: "",
  grupoSanguineo: "",
  obraSocial: "",
  condicionMedica: "",
};

export default function InscripcionPage() {
  const { data: grupos } = useGrupos();
  const { data: tiposCuota } = useTiposCuota();

  const [form, setForm] = useState(EMPTY_FORM);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombreCompleto.trim() || !form.dni.trim() || !form.email.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      let comprobanteInscripcionUrl: string | undefined;
      if (comprobanteFile) {
        comprobanteInscripcionUrl = await uploadArchivoSocio("comprobantes", form.dni.trim(), comprobanteFile);
      }
      const tipoCuotaPorDefecto = tiposCuota.find((t) => t.porDefecto) || tiposCuota[0];
      await addDoc(collection(db, "socios"), {
        nombreCompleto: form.nombreCompleto.trim(),
        dni: form.dni.trim(),
        email: form.email.trim(),
        telefono: form.telefono || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        contactoEmergencia: form.contactoEmergencia || undefined,
        grupoId: form.grupoId || null,
        grupoSanguineo: form.grupoSanguineo || undefined,
        obraSocial: form.obraSocial || undefined,
        condicionMedica: form.condicionMedica || undefined,
        comprobanteInscripcionUrl,
        estado: "Pendiente",
        deuda: "Al día",
        grupoFamiliar: null,
        tipoCuotaId: tipoCuotaPorDefecto?.id || "",
        createdAt: serverTimestamp(),
      });
      setEnviado(true);
    } catch {
      setError("No pudimos enviar tu inscripción. Probá de nuevo en un momento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto text-green-600" size={32} />
          <h1 className="text-lg font-semibold text-gray-900">¡Listo!</h1>
          <p className="text-sm text-gray-500">
            Recibimos tu inscripción. El club se va a contactar para confirmar tus datos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
            <Waves size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Inscripción a Canotaje Córdoba</h1>
            <p className="text-sm text-gray-500">Completá tus datos para sumarte al club.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre completo *</label>
              <input
                type="text"
                required
                placeholder="Juan Pérez"
                value={form.nombreCompleto}
                onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">DNI *</label>
              <input
                type="text"
                required
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
                required
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
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={form.fechaNacimiento}
                onChange={(e) => setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
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
            {grupos.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Grupo</label>
                <select
                  value={form.grupoId}
                  onChange={(e) => setForm((f) => ({ ...f, grupoId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="">No sé / no corresponde</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            <div className="sm:col-span-2">
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Adjuntar comprobante de inscripción (opcional)</label>
              <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50 text-gray-700">
                <Paperclip size={16} />
                {comprobanteFile ? comprobanteFile.name : "Elegir archivo..."}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setComprobanteFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Enviando..." : "Enviar inscripción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
