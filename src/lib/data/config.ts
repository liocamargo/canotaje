"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ClubConfig } from "@/lib/types";

const DOC_PATH = ["config", "general"] as const;

export const DEFAULT_CONFIG: ClubConfig = {
  nombreClub: "Canotaje Córdoba",
  emailContacto: "",
  telefono: "",
  diaVencimiento: 10,
  enviarEmails: true,
};

export function useClubConfig() {
  const [config, setConfig] = useState<ClubConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, ...DOC_PATH),
      (snap) => {
        setConfig(snap.exists() ? { ...DEFAULT_CONFIG, ...(snap.data() as ClubConfig) } : DEFAULT_CONFIG);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { config, loading };
}

export async function saveClubConfig(data: Partial<ClubConfig>) {
  await setDoc(doc(db, ...DOC_PATH), data, { merge: true });
}
