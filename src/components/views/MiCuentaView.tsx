"use client";

import { useAuth } from "@/lib/auth/AuthProvider";

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  profesor: "Profesor",
  secretaria: "Secretaría",
};

export function MiCuentaView() {
  const { user, staff } = useAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Mi cuenta</h3>
        <p className="text-sm text-gray-500">Tu información de acceso al panel</p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Nombre</p>
          <p className="text-sm text-gray-900">
            {staff?.nombre || staff?.apellido ? `${staff?.nombre ?? ""} ${staff?.apellido ?? ""}`.trim() : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
          <p className="text-sm text-gray-900">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Rol</p>
          <p className="text-sm text-gray-900">{staff ? ROL_LABEL[staff.rol] : "—"}</p>
        </div>
        {staff?.telefono && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
            <p className="text-sm text-gray-900">{staff.telefono}</p>
          </div>
        )}
      </div>
    </div>
  );
}
