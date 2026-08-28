"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { Mail, Waves } from "lucide-react";
import { auth } from "@/lib/firebase";
import { activateStaffIfInvited, tryBootstrapAdmin, useAuth } from "@/lib/auth/AuthProvider";

const EMAIL_STORAGE_KEY = "canotaje:emailForSignIn";

export default function LoginPage() {
  const router = useRouter();
  const { user, authLoading, staff, staffLoading, logOut } = useAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "completing" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    let storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!storedEmail) {
      storedEmail = window.prompt(
        "Confirmá tu email para completar el ingreso"
      );
    }
    if (!storedEmail) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the one-time email-link completion on mount
    setStatus("completing");
    signInWithEmailLink(auth, storedEmail, window.location.href)
      .then(async (cred) => {
        window.localStorage.removeItem(EMAIL_STORAGE_KEY);
        window.history.replaceState({}, document.title, "/login");
        await tryBootstrapAdmin(cred.user);
        await activateStaffIfInvited(cred.user);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message ?? "No se pudo completar el ingreso.");
      });
  }, []);

  useEffect(() => {
    if (!authLoading && !staffLoading && user && staff) {
      router.replace("/");
    }
  }, [authLoading, staffLoading, user, staff, router]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return;

    setStatus("sending");
    setErrorMsg("");
    try {
      await sendSignInLinkToEmail(auth, trimmedEmail, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_STORAGE_KEY, trimmedEmail);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo enviar el enlace.");
    }
  };

  if (authLoading || staffLoading || status === "completing") {
    return <CenteredMessage>Cargando...</CenteredMessage>;
  }

  if (user && !staff) {
    return (
      <CenteredMessage>
        <div className="max-w-sm text-center space-y-4">
          <p className="text-sm text-gray-700">
            Tu cuenta <span className="font-medium">{user.email}</span> todavía no tiene
            acceso al panel de Canotaje Córdoba.
          </p>
          <p className="text-xs text-gray-500">
            Pedile a un administrador del club que te invite desde
            Colaboradores.
          </p>
          <button
            onClick={() => logOut()}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </CenteredMessage>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-8 space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
            <Waves size={22} />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Canotaje Córdoba</h1>
          <p className="text-sm text-gray-500">Panel de administración</p>
        </div>

        <GoogleButton />

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          o con tu email
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {status === "sent" ? (
          <div className="text-center space-y-2 py-2">
            <Mail className="mx-auto text-gray-400" size={28} />
            <p className="text-sm text-gray-700">
              Te enviamos un enlace de acceso a <span className="font-medium">{email}</span>.
            </p>
            <p className="text-xs text-gray-500">
              Abrilo desde este mismo dispositivo para ingresar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendLink} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {status === "sending" ? "Enviando..." : "Enviarme un enlace de acceso"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-xs text-red-600 text-center">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}

function GoogleButton() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await signInWithGoogle();
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
    >
      <GoogleIcon />
      {loading ? "Conectando..." : "Continuar con Google"}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.4 0 10.3-1.9 14-5.1l-6.6-5.4C29.4 36.1 26.8 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 40.5 16.2 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.8l6.6 5.4C41.4 36 44 30.6 44 24c0-1.4-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-sm text-gray-500">
      {children}
    </div>
  );
}
