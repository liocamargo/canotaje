"use client";

import { deleteDoc, doc, orderBy, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/lib/data/useCollection";
import type { Staff, StaffRole } from "@/lib/types";

const COLLECTION = "staff";

export function useStaff() {
  return useCollection<Staff & { id: string }>(COLLECTION, [orderBy("email", "asc")]);
}

export async function inviteStaff(data: {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  etiqueta?: string;
  rol: StaffRole;
}) {
  const email = data.email.trim().toLowerCase();
  await setDoc(doc(db, COLLECTION, email), {
    ...data,
    email,
    estado: "invitado",
    invitedAt: serverTimestamp(),
  });
}

export async function updateStaffRole(email: string, data: Partial<Pick<Staff, "rol" | "nombre" | "apellido" | "telefono" | "etiqueta">>) {
  await updateDoc(doc(db, COLLECTION, email.trim().toLowerCase()), data);
}

export async function removeStaff(email: string) {
  await deleteDoc(doc(db, COLLECTION, email.trim().toLowerCase()));
}
