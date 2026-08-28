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

export function formatMonto(value: number): string {
  return value.toLocaleString("es-AR");
}

// Formatea un monto mientras se escribe: punto para miles, coma para decimales (formato ARS).
export function formatMontoInput(raw: string): string {
  let cleaned = raw.replace(/[^\d,]/g, "");
  const firstComma = cleaned.indexOf(",");
  if (firstComma !== -1) {
    cleaned = cleaned.slice(0, firstComma + 1) + cleaned.slice(firstComma + 1).replace(/,/g, "");
  }
  const [intPart, decPart] = cleaned.split(",");
  const intDigits = (intPart || "").replace(/^0+(?=\d)/, "");
  const intFormatted = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (decPart !== undefined) {
    return `${intFormatted || "0"},${decPart.slice(0, 2)}`;
  }
  return intFormatted;
}

export function parseMontoInput(formatted: string): number {
  return Number(formatted.replace(/\./g, "").replace(",", ".")) || 0;
}
