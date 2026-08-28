"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Staff } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  authLoading: boolean;
  staff: Staff | null;
  staffLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function staffDocId(email: string) {
  return email.trim().toLowerCase();
}

export async function activateStaffIfInvited(user: User) {
  if (!user.email) return;
  const ref = doc(db, "staff", staffDocId(user.email));
  try {
    await updateDoc(ref, {
      estado: "activo",
      uid: user.uid,
      activatedAt: serverTimestamp(),
    });
  } catch {
    // El usuario no fue invitado, o su cuenta ya estaba activa: se ignora.
  }
}

export async function tryBootstrapAdmin(user: User) {
  if (!user.email) return;
  const ref = doc(db, "staff", staffDocId(user.email));
  try {
    await setDoc(ref, {
      email: user.email,
      nombre: user.displayName ?? "",
      apellido: "",
      rol: "admin",
      etiqueta: "Fundador",
      estado: "activo",
      uid: user.uid,
      invitedAt: serverTimestamp(),
      activatedAt: serverTimestamp(),
    });
  } catch {
    // El email no está en la lista de bootstrap admins de firestore.rules, o el doc ya existe.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting staff when the user signs out
      setStaff(null);
      setStaffLoading(false);
      return;
    }
    setStaffLoading(true);
    const ref = doc(db, "staff", staffDocId(user.email));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setStaff(snap.exists() ? (snap.data() as Staff) : null);
        setStaffLoading(false);
      },
      () => {
        setStaff(null);
        setStaffLoading(false);
      }
    );
    return unsub;
  }, [user?.email]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authLoading,
      staff,
      staffLoading,
      signInWithGoogle: async () => {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        await tryBootstrapAdmin(cred.user);
        await activateStaffIfInvited(cred.user);
      },
      logOut: () => signOut(auth),
    }),
    [user, authLoading, staff, staffLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
