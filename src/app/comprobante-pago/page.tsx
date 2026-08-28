"use client";

import { useState } from "react";
import { CheckCircle2, Paperclip, Waves } from "lucide-react";
import { addComprobantePago } from "@/lib/data/comprobantesPago";
import { uploadArchivoSocio } from "@/lib/storage";

export default function ComprobantePagoPage() {
  const [dni, setDni] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !file) return;

    setSubmitting(true);
    setError(null);
    try {
      const comprobanteUrl = await uploadArchivoSocio("comprobantes-pago", dni.trim(), file);
      await addComprobantePago({ dni: dni.trim(), comprobanteUrl });
      setEnviado(true);
    } catch {
      setError("No pudimos enviar tu comprobante. Probá de nuevo en un momento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto text-green-600" size={32} />
          <h1 className="text-lg font-semibold text-gray-900">¡Recibido!</h1>
          <p className="text-sm text-gray-500">
            El club va a revisar tu comprobante y acreditar el pago en tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
            <Waves size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Enviar comprobante de pago</h1>
            <p className="text-sm text-gray-500">Canotaje Córdoba</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Tu DNI *</label>
            <input
              type="text"
              required
              placeholder="12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se usa para que el club identifique a qué socio corresponde el pago.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comprobante (imagen o PDF) *</label>
            <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50 text-gray-700">
              <Paperclip size={16} />
              {file ? file.name : "Elegir archivo..."}
              <input
                type="file"
                required
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !dni.trim() || !file}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Enviando..." : "Enviar comprobante"}
          </button>
        </form>
      </div>
    </div>
  );
}
