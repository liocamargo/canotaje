"use client";

import { useState } from "react";
import { Plus, Star, Trash2, X } from "lucide-react";
import { addGrupo, deleteGrupo, updateGrupo, useGrupos } from "@/lib/data/grupos";
import { useStaff } from "@/lib/data/staff";
import { useSocios } from "@/lib/data/socios";
import type { Grupo } from "@/lib/types";

export function GruposCard() {
  const { data: grupos, loading } = useGrupos();
  const { data: staff } = useStaff();
  const { data: socios } = useSocios();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openNuevo = () => {
    setEditingId(null);
    setNombre("");
    setShowModal(true);
  };

  const openEditar = (g: Grupo) => {
    setEditingId(g.id);
    setNombre(g.nombre);
    setShowModal(true);
  };

  const close = () => {
    setShowModal(false);
    setEditingId(null);
    setNombre("");
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateGrupo(editingId, { nombre: nombre.trim() });
      } else {
        await addGrupo({ nombre: nombre.trim(), profesorEmail: "", porDefecto: false });
      }
      close();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (
      window.confirm(
        "¿Seguro que querés eliminar este grupo? Los socios asignados quedarán sin grupo."
      )
    ) {
      await deleteGrupo(id);
    }
  };

  const handleMarcarDefecto = async (id: string) => {
    const otros = grupos.filter((g) => g.porDefecto && g.id !== id);
    for (const otro of otros) {
      await updateGrupo(otro.id, { porDefecto: false });
    }
    await updateGrupo(id, { porDefecto: true });
  };

  const contarSocios = (grupoId: string) => socios.filter((s) => s.grupoId === grupoId).length;
  const nombreProfesor = (email: string) => {
    const p = staff.find((s) => s.email === email);
    return p ? `${p.nombre} ${p.apellido}`.trim() || p.email : "Sin profesor asignado";
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Grupos</h3>
          <p className="text-sm text-gray-500">
            El profesor a cargo de cada grupo se asigna desde su perfil en
            Colaboradores. Un profesor sólo ve a los socios de sus propios grupos.
          </p>
        </div>
        <button
          onClick={openNuevo}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 border px-3 py-1.5 rounded-md hover:bg-gray-50"
        >
          <Plus size={16} /> Nuevo grupo
        </button>
      </div>

      <div className="border rounded-lg divide-y">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Cargando grupos...</div>
        ) : grupos.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Todavía no hay grupos creados.</div>
        ) : (
          grupos.map((g) => (
            <div
              key={g.id}
              onClick={() => openEditar(g)}
              className="flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{g.nombre}</span>
                  {g.porDefecto && (
                    <span className="text-[10px] bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-medium">
                      Por defecto
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {nombreProfesor(g.profesorEmail)} · {contarSocios(g.id)} socio
                  {contarSocios(g.id) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!g.porDefecto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarcarDefecto(g.id);
                    }}
                    title="Marcar como grupo por defecto"
                    className="p-1.5 text-gray-400 hover:text-gray-900"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminar(g.id);
                  }}
                  title="Eliminar grupo"
                  className="p-1.5 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingId ? "Editar grupo" : "Nuevo grupo"}</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del grupo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juveniles, Categoría A..."
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              {editingId && (
                <p className="text-xs text-gray-500">
                  Para asignarle un profesor, editá su perfil desde Colaboradores. Para
                  marcarlo como grupo por defecto, usá la estrella en la lista.
                </p>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={close}
                className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={!nombre.trim() || submitting}
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
