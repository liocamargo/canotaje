"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useMisGrupos } from "@/lib/data/grupos";
import type { Socio } from "@/lib/types";

const COLLECTION = "socios";
const BATCH_CHUNK_SIZE = 400;
const SIN_GRUPO = "__sin-grupo-asignado__";

// Un profesor sólo ve los socios de los grupos que tiene asignados; el resto del
// staff (admin, secretaría) ve a todos. Esto también es lo que permiten las reglas
// de Firestore (firestore.rules), así que el filtro de acá no es sólo cosmético: sin
// él, la consulta sin filtrar sería rechazada por las reglas para un profesor.
export function useSocios() {
  const { staff } = useAuth();
  const { data: misGrupos } = useMisGrupos();
  const esProfesor = staff?.rol === "profesor";

  const constraints = esProfesor
    ? [
        where("grupoId", "in", misGrupos.length > 0 ? misGrupos.map((g) => g.id).slice(0, 30) : [SIN_GRUPO]),
        orderBy("nombreCompleto", "asc"),
      ]
    : [orderBy("nombreCompleto", "asc")];

  return useCollection<Socio>(COLLECTION, constraints);
}

export async function addSocio(data: Omit<Socio, "id" | "createdAt">) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateSocio(id: string, data: Partial<Omit<Socio, "id">>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteSocio(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function addSociosBatch(items: Omit<Socio, "id" | "createdAt">[]) {
  for (let i = 0; i < items.length; i += BATCH_CHUNK_SIZE) {
    const chunk = items.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      batch.set(doc(collection(db, COLLECTION)), {
        ...item,
        createdAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }
}
