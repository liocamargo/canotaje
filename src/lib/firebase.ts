import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { type Analytics, isSupported as isAnalyticsSupported, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Faltan las variables NEXT_PUBLIC_FIREBASE_* (por ejemplo en Vercel → Settings → Environment Variables, " +
      "o en .env.local en desarrollo). Sin ellas Firebase no puede inicializarse."
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Los formularios arman los datos a guardar con campos opcionales en `undefined`
// (ej. `telefono: form.telefono || undefined`); ignoreUndefinedProperties evita que
// Firestore rechace el documento entero por eso, en vez de tener que limpiar cada
// objeto a mano antes de cada addDoc/setDoc/updateDoc.
let firestoreDb;
try {
  firestoreDb = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
} catch {
  // Ya se había inicializado (por ejemplo, tras un hot-reload en desarrollo).
  firestoreDb = getFirestore(firebaseApp);
}
export const db = firestoreDb;

export const storage = getStorage(firebaseApp);

let analyticsPromise: Promise<Analytics | null> | null = null;

// Analytics sólo funciona en el navegador y en entornos que soporten IndexedDB,
// por eso se inicializa de forma perezosa y nunca durante SSR.
export function getAnalyticsIfSupported(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = isAnalyticsSupported().then((supported) =>
      supported ? getAnalytics(firebaseApp) : null
    );
  }
  return analyticsPromise;
}
