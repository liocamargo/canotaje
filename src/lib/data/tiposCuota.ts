"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { TipoCuota } from "@/lib/types";

const COLLECTION = "tiposCuota";

export function useTiposCuota() {
  return useCollection<TipoCuota>(COLLECTION, [orderBy("monto", "asc")]);
}

export async function addTipoCuota(data: Omit<TipoCuota, "id">) {
  await addDoc(collection(db, COLLECTION), data);
}

export async function updateTipoCuota(id: string, data: Partial<Omit<TipoCuota, "id">>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteTipoCuota(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
