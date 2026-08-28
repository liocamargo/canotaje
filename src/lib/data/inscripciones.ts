"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Inscripcion } from "@/lib/types";

const COLLECTION = "inscripciones";

export function useInscripcionesPorActividad(actividadId: string) {
  return useCollection<Inscripcion>(
    COLLECTION,
    actividadId ? [where("actividadId", "==", actividadId)] : []
  );
}

export async function addInscripcion(data: Omit<Inscripcion, "id">) {
  await addDoc(collection(db, COLLECTION), data);
}

export async function updateInscripcion(id: string, data: Partial<Omit<Inscripcion, "id">>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteInscripcion(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
