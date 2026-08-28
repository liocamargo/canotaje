"use client";

import { doc, limit, orderBy, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Asistencia } from "@/lib/types";

const COLLECTION = "asistencias";

export function useAsistenciasPorFecha(fecha: string) {
  return useCollection<Asistencia>(COLLECTION, [where("fecha", "==", fecha)]);
}

export function useAsistenciasPorSocio(socioId: string, take = 10) {
  return useCollection<Asistencia>(COLLECTION, [
    where("socioId", "==", socioId),
    orderBy("fecha", "desc"),
    limit(take),
  ]);
}

export async function toggleAsistencia(socioId: string, fecha: string, presente: boolean) {
  await setDoc(
    doc(db, COLLECTION, `${fecha}_${socioId}`),
    { socioId, fecha, presente },
    { merge: true }
  );
}
