# Pruebas con Expo Go (Android)

Esta guía es para probar la app móvil del gym en tu teléfono Android usando **Expo Go**.

## Requisitos

- **Android** con Expo Go instalado ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **PC** con el proyecto abierto (este repositorio)
- Móvil y PC en la **misma red Wi‑Fi** (importante para que el dispositivo vea el servidor de desarrollo)

## Pasos para probar

### 1. Instalar dependencias

En la carpeta del proyecto (donde está `package.json`):

```bash
npm install
```

o si usas Bun:

```bash
bun install
```

### 2. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Se abrirá una ventana en el navegador con un código QR y opciones.

### 3. Abrir la app en el móvil (Expo Go)

1. Abre **Expo Go** en tu Android.
2. Escanea el **código QR** que muestra la terminal o la página web de Expo.
3. La app se cargará en el teléfono (puede tardar un poco la primera vez).

### 4. Probar solo la interfaz (sin backend)

Si aún no tienes el backend (Node + MySQL) levantado:

- La pantalla **Inicio** se verá bien; la lista “Mis máquinas en uso” estará vacía (o puede aparecer un error de red que se ignora y se muestra vacía).
- Puedes entrar a **Escanear QR** y probar la cámara y el flujo; al escanear un QR sin API verás un mensaje de error de conexión, que es esperado.

### 5. Probar con backend (API)

Cuando tengas el MIS (React + Node.js + MySQL) corriendo:

1. Anota la **IP de tu PC** en la red local (en Windows: `ipconfig`, busca “Adaptador de Ethernet” o “Wi-Fi” → Dirección IPv4).
2. Crea un archivo **`.env`** en la raíz del proyecto con:

   ```env
   EXPO_PUBLIC_API_URL=http://TU_IP:PUERTO/api
   ```

   Ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api`

3. Reinicia Expo para que lea la variable:

   ```bash
   npx expo start
   ```

4. En el móvil, vuelve a abrir la app (recentrando el QR o recargando en Expo Go).
5. Escanea un QR que tu backend reconozca (por ejemplo, un código que devuelva o contenga `maquina_id`). La app intentará registrar el uso y te llevará a la pantalla “En uso”; desde ahí puedes “Liberar máquina”.

### 6. Formato del QR para máquinas

La app acepta:

- Un **número** (id de máquina), ej: `3`
- Un **JSON** con `maquina_id` o `id`, ej: `{"maquina_id": 3}` o `{"id": 3}`

El backend debe tener un endpoint `POST /api/uso-activo` que reciba `maquina_id` (y opcionalmente `usuario_id`) y cree el registro en `uso_activo`, y otro para listar y otro para eliminar (liberar). Los servicios en `src/services/api.ts` están preparados para eso.

## Resumen de pantallas

| Pantalla   | Descripción                                              |
|-----------|----------------------------------------------------------|
| **Inicio** | Lista “Mis máquinas en uso” y botón “Escanear QR”.       |
| **Escanear QR** | Cámara para escanear el QR de la máquina y bloquearla.   |
| **En uso** | Detalle de la máquina bloqueada y botón “Liberar máquina”. |

## Problemas frecuentes

- **“Unable to resolve module”**: ejecuta de nuevo `npm install` o `bun install` y reinicia `npx expo start`.
- **Cámara no abre**: revisa que Expo Go tenga permiso de cámara en Ajustes del teléfono.
- **Error de red al escanear**: sin backend la petición falla; con backend, comprueba que la URL en `.env` use la IP de tu PC y que el móvil esté en la misma Wi‑Fi.
- **QR no escaneado**: asegúrate de que el código sea válido (número o JSON con `maquina_id`/`id`) y que haya buena luz y enfoque.
