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
import type { Socio } from "@/lib/types";

const COLLECTION = "socios";

export function useSocios() {
  return useCollection<Socio>(COLLECTION, [orderBy("nombre", "asc")]);
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
