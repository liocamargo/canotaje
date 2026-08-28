"use client";

import { useState } from "react";
import { Briefcase, Edit2, Plus, Trash2, X } from "lucide-react";
import { inviteStaff, removeStaff, updateStaffRole, useStaff } from "@/lib/data/staff";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Staff, StaffRole } from "@/lib/types";

const ROL_LABEL: Record<StaffRole, string> = {
  admin: "Administrador",
  profesor: "Profesor",
  secretaria: "Secretaría",
};

interface StaffFormState {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: StaffRole | "";
}

const EMPTY_FORM: StaffFormState = {
  email: "",
  nombre: "",
  apellido: "",
  telefono: "",
  rol: "",
};

export function ColaboradoresView() {
  const { data, loading, error } = useStaff();
  const { user } = useAuth();

  const [tab, setTab] = useState<"empleados" | "cargos">("empleados");
  const [showModal, setShowModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  const currentEmail = user?.email?.toLowerCase() ?? null;
  const isEditing = editingEmail !== null;
  const canSubmit = form.email.trim().length > 0 && form.rol !== "" && !submitting;

  function openNewModal() {
    setEditingEmail(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(row: Staff & { id: string }) {
    setEditingEmail(row.email);
    setForm({
      email: row.email,
      nombre: row.nombre,
      apellido: row.apellido,
      telefono: row.telefono ?? "",
      rol: row.rol,
    });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEmail(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSubmit() {
    if (!canSubmit || form.rol === "") return;
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingEmail) {
        await updateStaffRole(editingEmail, {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono || undefined,
          rol: form.rol,
        });
      } else {
        await inviteStaff({
          email: form.email,
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono || undefined,
          rol: form.rol,
        });
      }
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: Staff & { id: string }) {
    if (row.email.toLowerCase() === currentEmail) return;
    const nombreCompleto = `${row.nombre} ${row.apellido}`.trim() || row.email;
    if (!window.confirm(`¿Eliminar a ${nombreCompleto} del equipo?`)) return;
    setDeletingEmail(row.email);
    try {
      await removeStaff(row.email);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se pudo eliminar al colaborador.");
    } finally {
      setDeletingEmail(null);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Colaboradores</h3>
          <p className="text-sm text-gray-500">Gestioná el equipo con acceso al panel</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} /> Alta de colaborador
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("empleados")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${tab === "empleados" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          Colaboradores
        </button>
        <button
          onClick={() => setTab("cargos")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${tab === "cargos" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          Roles y Permisos
        </button>
      </div>

      {tab === "empleados" && (
        <>
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white border rounded-xl p-12 text-center text-sm text-gray-500">
              Cargando colaboradores...
            </div>
          ) : data.length === 0 ? (
            /* Empty State */
            <div className="bg-white border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">No hay colaboradores todavía</h4>
                <p className="text-sm text-gray-500 mt-1">Invitá a profesores y administrativos para empezar.</p>
              </div>
              <button
                onClick={openNewModal}
                className="mt-4 px-4 py-2 bg-white border shadow-sm rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Agregar colaborador
              </button>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">Nombre</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">Email</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">Rol</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">Estado</th>
                    <th className="text-right font-medium text-gray-500 px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((row) => {
                    const isSelf = row.email.toLowerCase() === currentEmail;
                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {row.nombre} {row.apellido}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{row.email}</td>
                        <td className="px-4 py-3 text-gray-700">{ROL_LABEL[row.rol]}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              row.estado === "activo" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {row.estado === "activo" ? "Activo" : "Invitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(row)}
                              title="Editar"
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              disabled={isSelf || deletingEmail === row.email}
                              title={isSelf ? "No podés eliminarte a vos mismo" : "Eliminar"}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "cargos" && (
        <div className="bg-white border rounded-xl divide-y">
          <div className="p-5">
            <h4 className="text-sm font-semibold text-gray-900">Administrador</h4>
            <p className="text-sm text-gray-500 mt-1">
              Acceso completo al panel: gestión de socios, pagos, actividades y, además, puede invitar, editar y
              eliminar colaboradores.
            </p>
          </div>
          <div className="p-5">
            <h4 className="text-sm font-semibold text-gray-900">Profesor</h4>
            <p className="text-sm text-gray-500 mt-1">
              Gestión operativa del club: socios, actividades, asistencias y pagos. No puede invitar ni eliminar
              colaboradores.
            </p>
          </div>
          <div className="p-5">
            <h4 className="text-sm font-semibold text-gray-900">Secretaría</h4>
            <p className="text-sm text-gray-500 mt-1">
              Gestión operativa del club: socios, pagos y actividades. No puede invitar ni eliminar colaboradores.
            </p>
          </div>
          <div className="p-5 bg-gray-50">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Próximamente: </span>
              hoy las reglas de Firestore sólo distinguen entre &quot;es staff&quot; y &quot;es admin&quot; para la
              colección de colaboradores; el resto de las colecciones (socios, pagos, actividades) son de lectura y
              escritura para cualquier miembro del staff. Los permisos por rol más granulares llegarán en una
              próxima versión.
            </p>
          </div>
        </div>
      )}

      {/* Modal Alta / Edición de Colaborador */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">
                  {isEditing ? "Editar colaborador" : "Agregar colaborador"}
                </h3>
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "Actualizá sus datos y rol de sistema."
                    : "Recibirá acceso al panel al iniciar sesión con este email."}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  disabled={isEditing}
                  placeholder="juanpablo@club.com"
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol de sistema</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as StaffRole | "" }))}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                >
                  <option value="">Seleccionar rol...</option>
                  <option value="admin">Administrador</option>
                  <option value="profesor">Profesor</option>
                  <option value="secretaria">Secretaría</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Alta de colaborador"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
