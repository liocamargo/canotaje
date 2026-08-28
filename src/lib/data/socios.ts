"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Socio } from "@/lib/types";

const COLLECTION = "socios";
const BATCH_CHUNK_SIZE = 400;

export function useSocios() {
  return useCollection<Socio>(COLLECTION, [orderBy("nombreCompleto", "asc")]);
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
