"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { addSociosBatch } from "@/lib/data/socios";
import type { Socio, SocioEstado, TipoCuota } from "@/lib/types";

export type CampoSocio =
  | "ignorar"
  | "nombreCompleto"
  | "estado"
  | "email"
  | "telefono"
  | "dni"
  | "fechaNacimiento"
  | "contactoEmergencia"
  | "categoria"
  | "condicionMedica";

const CAMPOS: { value: CampoSocio; label: string }[] = [
  { value: "ignorar", label: "No importar" },
  { value: "nombreCompleto", label: "Nombre Completo" },
  { value: "estado", label: "Estado" },
  { value: "email", label: "Correo Electrónico" },
  { value: "telefono", label: "Teléfono de contacto" },
  { value: "dni", label: "DNI" },
  { value: "fechaNacimiento", label: "Fecha de Nacimiento" },
  { value: "contactoEmergencia", label: "Contacto de Emergencia" },
  { value: "categoria", label: "Categoría" },
  { value: "condicionMedica", label: "Condición médica o alergia" },
];

const CAMPOS_REQUERIDOS: CampoSocio[] = ["nombreCompleto", "dni", "email"];
const ESTADOS_VALIDOS: SocioEstado[] = ["Activo", "Pendiente", "Inactivo"];

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function normalizeHeader(header: string): string {
  return header.normalize("NFD").replace(DIACRITICS_REGEX, "").toLowerCase().trim();
}

function adivinarCampo(header: string): CampoSocio {
  const h = normalizeHeader(header);
  if (h === "nombre completo" || h === "nombre y apellido") return "nombreCompleto";
  if (h === "estado") return "estado";
  if (h.includes("correo") || h === "email") return "email";
  if (h.includes("telefono")) return "telefono";
  if (h === "dni") return "dni";
  if (h.includes("fecha de nacimiento")) return "fechaNacimiento";
  if (h.includes("contacto de emergencia")) return "contactoEmergencia";
  if (h === "categoria") return "categoria";
  if (h.includes("condicion") || h.includes("alergia")) return "condicionMedica";
  return "ignorar";
}

export function ImportarSociosModal({
  headers,
  rows,
  tiposCuota,
  onClose,
  onImported,
}: {
  headers: string[];
  rows: string[][];
  tiposCuota: TipoCuota[];
  onClose: () => void;
  onImported: (result: { ok: number; errores: string[] }) => void;
}) {
  const [mapping, setMapping] = useState<CampoSocio[]>(() => headers.map(adivinarCampo));
  const [importing, setImporting] = useState(false);

  const duplicados = new Set<CampoSocio>();
  const vistos = new Set<CampoSocio>();
  mapping.forEach((campo) => {
    if (campo === "ignorar") return;
    if (vistos.has(campo)) duplicados.add(campo);
    vistos.add(campo);
  });

  const faltantes = CAMPOS_REQUERIDOS.filter((campo) => !mapping.includes(campo));
  const puedeImportar = faltantes.length === 0 && duplicados.size === 0 && !importing;

  const handleImportar = async () => {
    setImporting(true);
    try {
      const tipoCuotaPorDefecto = tiposCuota.find((t) => t.porDefecto) || tiposCuota[0];
      const indiceDe = (campo: CampoSocio) => mapping.findIndex((m) => m === campo);
      const idxNombre = indiceDe("nombreCompleto");
      const idxEstado = indiceDe("estado");
      const idxEmail = indiceDe("email");
      const idxTelefono = indiceDe("telefono");
      const idxDni = indiceDe("dni");
      const idxFecha = indiceDe("fechaNacimiento");
      const idxContacto = indiceDe("contactoEmergencia");
      const idxCategoria = indiceDe("categoria");
      const idxCondicion = indiceDe("condicionMedica");

      const errores: string[] = [];
      const nuevosSocios: Omit<Socio, "id" | "createdAt">[] = [];

      rows.forEach((fila, index) => {
        const val = (idx: number) => (idx === -1 ? "" : (fila[idx] ?? "").trim());
        const nombreCompleto = val(idxNombre);
        const dni = val(idxDni);
        const email = val(idxEmail);
        const numeroFila = index + 2;

        if (!nombreCompleto || !dni || !email) {
          errores.push(`Fila ${numeroFila}: falta Nombre Completo, DNI o Correo Electrónico.`);
          return;
        }

        const estadoRaw = val(idxEstado);
        const estado = ESTADOS_VALIDOS.includes(estadoRaw as SocioEstado)
          ? (estadoRaw as SocioEstado)
          : "Pendiente";

        nuevosSocios.push({
          nombreCompleto,
          estado,
          email,
          telefono: val(idxTelefono) || undefined,
          dni,
          fechaNacimiento: val(idxFecha) || undefined,
          contactoEmergencia: val(idxContacto) || undefined,
          categoria: val(idxCategoria) || undefined,
          condicionMedica: val(idxCondicion) || undefined,
          deuda: "Al día",
          grupoFamiliar: null,
          tipoCuotaId: tipoCuotaPorDefecto?.id || "",
        });
      });

      if (nuevosSocios.length > 0) {
        await addSociosBatch(nuevosSocios);
      }
      onImported({ ok: nuevosSocios.length, errores });
      onClose();
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-semibold text-lg">Emparejar columnas</h3>
            <p className="text-sm text-gray-500">
              Elegí a qué campo corresponde cada columna de tu archivo, sin importar el orden.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-3">
          {headers.map((header, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{header || `Columna ${i + 1}`}</p>
                {rows[0]?.[i] && <p className="text-xs text-gray-400 truncate">Ej: {rows[0][i]}</p>}
              </div>
              <select
                value={mapping[i]}
                onChange={(e) =>
                  setMapping((prev) =>
                    prev.map((m, idx) => (idx === i ? (e.target.value as CampoSocio) : m))
                  )
                }
                className={`w-56 px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 ${
                  mapping[i] !== "ignorar" && duplicados.has(mapping[i]) ? "border-red-400" : ""
                }`}
              >
                {CAMPOS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {duplicados.size > 0 && (
            <p className="text-sm text-red-600">
              Hay más de una columna asignada al mismo campo. Corregí eso antes de importar.
            </p>
          )}
          {faltantes.length > 0 && (
            <p className="text-sm text-amber-600">
              Faltan mapear campos obligatorios:{" "}
              {faltantes.map((f) => CAMPOS.find((c) => c.value === f)?.label).join(", ")}.
            </p>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleImportar}
            disabled={!puedeImportar}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? "Importando..." : `Importar ${rows.length} fila${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
