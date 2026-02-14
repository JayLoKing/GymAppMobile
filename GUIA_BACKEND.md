# Guía para integrar el backend (MIS) con la app móvil

Esta app (front end Android con Expo/React Native) ya está lista. Solo falta que el backend (Node.js + MySQL) exponga las rutas que la app espera. Esta guía indica **qué debe implementar el backend** y **dónde está cada cosa** en el repo para no perderse.

---

## 1. Dónde está cada cosa en el proyecto

```
GymAppMobile/
├── App.tsx                    # Punto de entrada; usa AppNavigator
├── index.ts                   # Registro de la app con Expo
├── app.json                   # Configuración de Expo (nombre, SDK, etc.)
├── package.json               # Dependencias (react-native-screens 4.16.0 por compatibilidad)
├── tsconfig.json              # TypeScript (sin extends de Expo)
│
├── src/
│   ├── config/
│   │   └── api.ts             # URL base del API. La app usa EXPO_PUBLIC_API_URL o localhost:3000/api
│   │
│   ├── types/
│   │   └── models.ts          # Tipos: Usuario, Maquina, UsoActivo, HistorialUso (alineados con la DB)
│   │
│   ├── services/
│   │   └── api.ts             # Cliente HTTP: todas las llamadas al backend (GET/POST/DELETE)
│   │
│   ├── theme/
│   │   └── colors.ts          # Colores del tema (blanco y negro)
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx   # Stack: Inicio → Escanear QR → En uso
│   │   └── types.tsx          # Tipos de rutas y parámetros
│   │
│   └── features/
│       ├── home/
│       │   └── HomeScreen.tsx       # Pantalla Inicio: lista "Mis máquinas en uso" + botón Escanear QR
│       ├── scanner/
│       │   └── ScannerScreen.tsx    # Cámara QR; al escanear llama POST /uso-activo y navega a En uso
│       └── activeUse/
│           └── ActiveUseScreen.tsx  # Pantalla "En uso": muestra máquina y botón "Liberar" (DELETE uso-activo)
│
├── .env.example               # Ejemplo: EXPO_PUBLIC_API_URL=http://IP:PUERTO/api
├── PRUEBAS_EXPO_GO.md         # Cómo probar la app en el celular con Expo Go
└── GUIA_BACKEND.md            # Esta guía
```

---

## 2. Qué debe exponer el backend (API esperada por la app)

La app usa **axios** contra una base URL configurable (por defecto `http://localhost:3000/api`). Todas las rutas van **debajo de `/api`** (o la base que pongas en `EXPO_PUBLIC_API_URL`).

### 2.1 Máquinas

| Método | Ruta | Uso en la app |
|--------|------|----------------|
| `GET` | `/api/maquinas` | Opcional: lista de máquinas. Parámetro opcional: `disponibles=true`. |
| `GET` | `/api/maquinas/:id` | Detalle de una máquina por ID. |

**Ejemplo de cuerpo esperado (GET maquinas):** array de objetos con al menos: `id`, `nombre`, y opcionalmente `tipo`, `ubicacion`, `estado`.

### 2.2 Uso activo (bloqueo de máquina al escanear QR)

| Método | Ruta | Uso en la app |
|--------|------|----------------|
| `POST` | `/api/uso-activo` | Al escanear un QR válido: crea el uso activo y “bloquea” la máquina. |
| `GET` | `/api/uso-activo` | Pantalla Inicio: lista “Mis máquinas en uso”. Parámetro opcional: `usuario_id`. |
| `DELETE` | `/api/uso-activo/:id` | Botón “Liberar máquina”: termina el uso y libera la máquina. |

**Cuerpo esperado del POST `/api/uso-activo`:**

```json
{
  "maquina_id": 3,
  "usuario_id": 1
}
```

- `maquina_id` es **obligatorio** (la app lo obtiene del QR).
- `usuario_id` es **opcional** (si hay login, el backend puede tomarlo del token/sesión).

**Respuesta esperada del POST:** objeto del uso creado, con al menos `id`, `maquina_id`, `usuario_id`, `fecha_inicio`. Opcionalmente el objeto anidado `maquina` con `nombre` (para mostrarlo en la pantalla “En uso”).

---

## 3. Formato del QR que lee la app

La app acepta:

- Un **número** (id de máquina), por ejemplo: `3`
- Un **JSON** con `maquina_id` o `id`, por ejemplo: `{"maquina_id": 3}` o `{"id": 3}`

El backend no tiene que generar el QR; solo debe aceptar ese `maquina_id` en el `POST /api/uso-activo`. Quién genere los QR (otro sistema o el MIS) debe usar ese formato.

---

## 4. Tablas de la base de datos (recordatorio)

Según el esquema que compartiste:

- **usuarios** – datos del usuario (id, nombre, email, etc.)
- **maquinas** – máquinas del gym (id, nombre, tipo, ubicacion, etc.)
- **uso_activo** – registro de “esta máquina está siendo usada por este usuario ahora”
- **historial_uso** – cuando se libera, se puede mover o copiar el registro aquí con fecha_fin y duración
- **ejercicios** – (la app no lo usa aún; queda para el backend si lo necesita)

---

## 5. Cómo probar con el backend desde el celular

1. Backend corriendo en la PC (por ejemplo en el puerto 3000).
2. En la raíz del proyecto móvil, crear un archivo `.env` con la **IP de la PC** en la red local:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.0.11:3000/api
   ```
   (Usar la IP real del backend y el puerto correcto.)
3. Reiniciar Expo (`npx expo start` o `bunx expo start`) y abrir la app de nuevo en Expo Go (mismo Wi‑Fi que la PC).

Más detalle en **PRUEBAS_EXPO_GO.md**.

---

## 6. Resumen para el desarrollador del backend

- **Configuración de la app:** `src/config/api.ts` (solo lee `EXPO_PUBLIC_API_URL` o usa `localhost:3000/api`).
- **Contrato de la API:** `src/services/api.ts` — ahí están todas las rutas y los tipos de request/response.
- **Tipos (DTOs):** `src/types/models.ts` — alinear respuestas del backend con estos tipos para evitar sorpresas.
- Implementar en Node.js (o el framework que uses):
  - `GET/POST/GET/DELETE` para `maquinas` y `uso-activo` como arriba.
  - Al recibir `POST /api/uso-activo`, crear fila en `uso_activo` y devolver el objeto creado (con `maquina` si quieres).
  - Al recibir `DELETE /api/uso-activo/:id`, borrar o marcar como terminado y, si aplica, escribir en `historial_uso`.

Con eso la app móvil quedará conectada al backend sin cambiar pantallas ni flujos; solo hace falta que las rutas y formatos coincidan con lo que usa `src/services/api.ts`.
