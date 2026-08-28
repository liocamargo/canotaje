"use client";

import { addDoc, collection, deleteDoc, doc, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { ComprobantePago } from "@/lib/types";

const COLLECTION = "comprobantesPago";

export function useComprobantesPago() {
  return useCollection<ComprobantePago>(COLLECTION, [orderBy("createdAt", "desc")]);
}

export async function addComprobantePago(data: { dni: string; comprobanteUrl: string }) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteComprobantePago(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
