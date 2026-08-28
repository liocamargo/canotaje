"use client";

import { addDoc, collection, deleteDoc, doc, orderBy, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Grupo } from "@/lib/types";

const COLLECTION = "grupos";

export function useGrupos() {
  return useCollection<Grupo>(COLLECTION, [orderBy("nombre", "asc")]);
}

export function useMisGrupos() {
  const { user } = useAuth();
  const email = user?.email?.toLowerCase() ?? "";
  return useCollection<Grupo>(COLLECTION, email ? [where("profesorEmail", "==", email)] : []);
}

export async function addGrupo(data: Omit<Grupo, "id">) {
  await addDoc(collection(db, COLLECTION), data);
}

export async function updateGrupo(id: string, data: Partial<Omit<Grupo, "id">>) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteGrupo(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
