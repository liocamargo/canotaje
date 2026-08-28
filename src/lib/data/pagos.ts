"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Pago } from "@/lib/types";

const COLLECTION = "pagos";
const BATCH_CHUNK_SIZE = 400;

export function usePagos() {
  return useCollection<Pago>(COLLECTION, [orderBy("fecha", "desc")]);
}

export async function addPago(data: Omit<Pago, "id" | "createdAt">) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function addPagosBatch(items: Omit<Pago, "id" | "createdAt">[]) {
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

export async function deletePago(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
