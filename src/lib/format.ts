export function getPeriodoActual(): string {
  const now = new Date();
  const mes = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(now);
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  return `${mesCapitalizado} De ${now.getFullYear()}`;
}

export function getFechaHoy(): string {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, "0");
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${now.getFullYear()}`;
}
