"use client";

import { useEffect, useState } from "react";
import {
  CollectionReference,
  Query,
  onSnapshot,
  QueryConstraint,
  collection,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useCollection<T>(
  path: string,
  constraints: QueryConstraint[] = []
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const constraintsKey = JSON.stringify(constraints.map((c) => c.type));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resubscribing on a new query must show loading again
    setLoading(true);
    const ref: CollectionReference = collection(db, path);
    const q: Query = constraints.length ? query(ref, ...constraints) : ref;

    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, constraintsKey]);

  return { data, loading, error };
}
