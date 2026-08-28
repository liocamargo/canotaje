import { Activity, Briefcase, CreditCard, Home, Settings, Users } from "lucide-react";

export type TabId =
  | "socios"
  | "pagos"
  | "actividades"
  | "colaboradores"
  | "configuracion"
  | "cuenta";

export const NAV_ITEMS: { id: TabId; icon: typeof Home; label: string }[] = [
  { id: "socios", icon: Users, label: "Socios" },
  { id: "pagos", icon: CreditCard, label: "Pagos" },
  { id: "actividades", icon: Activity, label: "Actividades" },
  { id: "colaboradores", icon: Briefcase, label: "Colaboradores" },
  { id: "configuracion", icon: Settings, label: "Configuración" },
];
