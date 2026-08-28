export type StaffRole = "admin" | "profesor" | "secretaria";
export type StaffEstado = "invitado" | "activo";

export interface Staff {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: StaffRole;
  estado: StaffEstado;
  uid?: string;
  invitedAt?: unknown;
  activatedAt?: unknown;
}

export type SocioEstado = "Activo" | "Pendiente" | "Inactivo";
export type SocioDeuda = "Admin" | "Al día" | "Debe cuota";

export interface Socio {
  id: string;
  nombreCompleto: string;
  email: string;
  dni: string;
  telefono?: string;
  fechaNacimiento?: string;
  contactoEmergencia?: string;
  condicionMedica?: string;
  comprobanteInscripcionUrl?: string;
  estado: SocioEstado;
  deuda: SocioDeuda;
  grupoFamiliar?: string | null;
  grupoId?: string | null;
  tipoCuotaId: string;
  createdAt?: unknown;
}

export interface Grupo {
  id: string;
  nombre: string;
  profesorEmail: string;
}

export interface TipoCuota {
  id: string;
  nombre: string;
  monto: number;
  porDefecto: boolean;
}

export type MetodoPago = "Efectivo" | "Transferencia" | "Tarjeta";

export interface Pago {
  id: string;
  socioId: string;
  socio: string;
  periodo: string;
  fecha: string;
  metodo: MetodoPago;
  monto: number;
  createdAt?: unknown;
}

export type ActividadTipo = "Regata" | "Travesía";
export type ActividadEstado = "Planificación" | "Confirmada" | "Próxima" | "Finalizada";

export interface Actividad {
  id: string;
  titulo: string;
  fecha: string;
  tipo: ActividadTipo;
  lugar: string;
  estado: ActividadEstado;
  descripcion?: string;
  createdAt?: unknown;
}

export interface Inscripcion {
  id: string;
  actividadId: string;
  socioId: string;
  socio: string;
  vehiculo?: string;
  bote?: string;
  pala?: string;
  confirmado: boolean;
}

export interface Asistencia {
  id: string;
  socioId: string;
  fecha: string;
  presente: boolean;
}

export interface ClubConfig {
  nombreClub: string;
  emailContacto: string;
  telefono?: string;
  diaVencimiento: number;
  enviarEmails: boolean;
}
