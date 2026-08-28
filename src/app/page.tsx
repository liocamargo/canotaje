"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AdminShell } from "@/components/AdminShell";

export default function Home() {
  const router = useRouter();
  const { user, authLoading, staff, staffLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !staffLoading && user && !staff) router.replace("/login");
  }, [authLoading, staffLoading, user, staff, router]);

  if (authLoading || staffLoading || !user || !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Cargando...
      </div>
    );
  }

  return <AdminShell />;
}
