"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Actividad } from "@/lib/types";

const COLLECTION = "actividades";

export function useActividades() {
  return useCollection<Actividad>(COLLECTION, [orderBy("fecha", "asc")]);
}

export async function addActividad(data: Omit<Actividad, "id" | "createdAt">) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateActividad(id: string, data: Partial<Omit<Actividad, "id">>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteActividad(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
