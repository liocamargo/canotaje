# Canotaje Córdoba — Panel de administración

App interna para gestionar socios, pagos, actividades y colaboradores del club. Next.js 16 (App Router) + Firebase (Auth + Firestore) + despliegue en Vercel.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) — todo el panel es client-side (Firebase SDK corre en el navegador).
- **Firebase Auth** — login por enlace de email (passwordless) y por Google.
- **Firestore** — base de datos en tiempo real (`onSnapshot` en todos los listados).
- **Vercel** — hosting del frontend. Firebase sólo se usa para Auth + Firestore, no para hosting.

## Proyecto Firebase

Ya está creado: `canotaje` (https://console.firebase.google.com/project/canotaje). Faltan habilitar, si no lo están:

1. **Authentication → Sign-in method**
   - Habilitar **Email/Password → Email link (passwordless sign-in)**.
   - Habilitar **Google**.
2. **Authentication → Settings → Authorized domains**
   - Agregar el dominio de Vercel de producción (ej. `canotaje.vercel.app` o tu dominio propio) y cualquier preview domain que uses seguido.
3. **Firestore Database** → crear la base en modo producción (las reglas de seguridad están en `firestore.rules`, no dejes la base en "modo de prueba").

## Cómo funciona el acceso (importante)

No hay usuarios "libres": sólo puede entrar al panel quien tenga un documento en la colección `staff` (colección de Firestore, un doc por email en minúsculas). Dos formas de llegar a tener ese documento:

- **Invitación**: un admin agrega a alguien desde la pantalla *Colaboradores*. Esto crea `staff/{email}` con `estado: "invitado"`. Cuando esa persona entra al panel (por Google o por enlace de email) con ese mismo email, la app activa el documento automáticamente (`estado: "activo"`).
- **Bootstrap inicial**: el primer administrador (vos) no tiene quién lo invite. Por eso `firestore.rules` tiene una lista de emails que pueden auto-asignarse `rol: "admin"` la primera vez que inician sesión — hoy sólo `luis@kiri.ar`. Editá la función `isBootstrapAdmin` en `firestore.rules` si necesitás agregar o cambiar ese email, y volvé a desplegar las reglas (ver más abajo).

Un usuario autenticado en Firebase Auth que **no** tenga documento en `staff` puede iniciar sesión pero no ve ningún dato — Firestore se lo deniega por reglas, y la pantalla de login le muestra un mensaje de "sin acceso".

## Desarrollo local

```bash
npm install
npm run dev
```

Las credenciales del proyecto Firebase ya están en `.env.local` (no se sube a git). Si cloná el repo en otra máquina, copiá `.env.local.example` a `.env.local` y completá los valores desde **Firebase Console → Configuración del proyecto → Tus apps → SDK setup and configuration**.

## Desplegar las reglas de Firestore

Las reglas (`firestore.rules`) no se despliegan solas — hace falta el Firebase CLI:

```bash
npm install -g firebase-tools   # una sola vez
firebase login
firebase use canotaje           # sólo la primera vez, o firebase init si pide vincular
firebase deploy --only firestore:rules
```

Corré esto cada vez que edites `firestore.rules` (por ejemplo, al cambiar la lista de bootstrap admins o al agregar una colección nueva).

## Desplegar en Vercel

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. En **Environment Variables**, copiá todas las variables de `.env.local` (las que empiezan con `NEXT_PUBLIC_FIREBASE_`). Son públicas por diseño — la seguridad real la dan las reglas de Firestore, no ocultar esta config.
3. Deploy. Después agregá el dominio que te asigne Vercel a **Authorized domains** en Firebase Auth (paso 2 de arriba) — si no, el login por Google o por enlace de email va a fallar en producción.

## Estructura

```
src/
  app/
    layout.tsx        # envuelve todo en <AuthProvider>
    page.tsx           # gate de auth + shell del panel
    login/page.tsx      # login (Google + enlace de email)
  components/
    layout/             # Sidebar, Header, SideDrawer
    views/               # una vista por módulo: Socios, Pagos, Actividades, Colaboradores, Configuración, Dashboard
    AdminShell.tsx        # arma el layout + tabs
  lib/
    firebase.ts           # init de Firebase (auth, db, analytics)
    types.ts                # tipos de todas las entidades
    auth/AuthProvider.tsx    # estado de sesión + activación/bootstrap de staff
    data/                     # un hook + funciones CRUD por colección de Firestore
firestore.rules              # reglas de seguridad (fuente de verdad de permisos)
_mockup/                      # diseño original de Claude Design, sólo de referencia — no se usa en la app
```

## Qué falta / próximos pasos

- Envío real de emails (recordatorios de pago, comprobantes) — hoy esos botones están deshabilitados, requieren un servicio de email (Resend, SendGrid, etc.) detrás de una función serverless.
- Importación/exportación de socios por CSV.
- Permisos más finos por rol (hoy cualquier `staff` puede editar cualquier colección operativa; sólo la gestión de colaboradores está restringida a `admin`).
