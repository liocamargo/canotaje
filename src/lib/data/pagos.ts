"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Pago } from "@/lib/types";

const COLLECTION = "pagos";

export function usePagos() {
  return useCollection<Pago>(COLLECTION, [orderBy("fecha", "desc")]);
}

export async function addPago(data: Omit<Pago, "id" | "createdAt">) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deletePago(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
