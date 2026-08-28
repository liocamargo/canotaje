import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export type SocioDocTipo = "comprobantes" | "fichas-medicas" | "deslindes" | "comprobantes-pago";

export async function uploadArchivoSocio(
  tipo: SocioDocTipo,
  dni: string,
  file: File
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `socios-docs/${tipo}/${dni || "sin-dni"}-${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
