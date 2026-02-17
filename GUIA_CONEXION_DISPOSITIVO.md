# 📱 Guía: Conectar App Mobile con Backend

## Problema: "Network Error" en Login

Si ves este error, el problema es que la app no puede conectarse a tu PC donde corre el backend.

---

## ✅ Solución Rápida (3 pasos)

### **Paso 1: Obtén la IP de tu PC**

**Windows (CMD):**
```
ipconfig
```
Busca `IPv4 Address:` en la sección de tu adaptador WiFi. Ejemplo: `192.168.1.10`

**Mac/Linux:**
```
ifconfig | grep inet
```
Busca la IP que comienza con `192.168` o `10.0`

---

### **Paso 2: Abre el archivo de configuración**

Archivo: `src/config/api.ts`

Busca esta línea:
```typescript
const API_URL = 'http://192.168.1.10:3000/api/v1'; // ← CAMBIA ESTO A TU IP
```

**Cambia `192.168.1.10` por tu IP real.** Ejemplo:
```typescript
const API_URL = 'http://192.168.0.5:3000/api/v1';
```

---

### **Paso 3: Guarda y recarga**

1. Guarda el archivo (`Ctrl+S`)
2. En Expo Go, pulsa `R` para recargar
3. Intenta hacer login nuevamente

---

## 🔍 Verifica estos puntos

✅ **Tu PC y teléfono están en la MISMA RED WiFi**
- Ambos conectados a la misma WiFi (no hotspot del teléfono)

✅ **Backend está corriendo**
```
npm run dev
# o
node index.js
```
Debe estar en: `http://localhost:3000`

✅ **Puerto no está bloqueado**
- Firewall de Windows permite puerto 3000
- En Mac/Linux: `sudo lsof -i :3000`

✅ **La IP es correcta**
- Prueba en tu navegador: `http://TU_IP:3000/api/v1/auth/profile`
- Deberías ver una respuesta JSON o un error 401 (sin Network Error)

---

## 📲 Diferentes Escenarios

### **Usando Emulador Android**
```typescript
const API_URL = 'http://10.0.2.2:3000/api/v1'; // IP especial para Android Emulator
```

### **Usando Emulador iOS**
```typescript
const API_URL = 'http://localhost:3000/api/v1'; // iOS puede usar localhost
```

### **Dispositivo Físico (Expo Go)**
```typescript
const API_URL = 'http://192.168.X.X:3000/api/v1'; // Tu IP local del PC
```

### **Backend en VPS/Nube**
```typescript
const API_URL = 'https://tudominio.com/api/v1'; // Tu dominio externo
```

---

## 🐛 Debugging

Si aún tienes problemas, abre la consola de Expo Go:

1. En la app, presiona `Ctrl+M` (Android) o `Cmd+D` (iOS)
2. Selecciona "View logs"
3. Verifica si dice:
   - ✅ `🔗 API Base URL: http://192.168.x.x:3000/api/v1` (URL correcta)
   - ❌ `Error de conexión` (revisar IP y firewall)
   - ❌ `401 Unauthorized` (credenciales incorrectas, pero servidor funciona ✓)

---

## 📋 Checklist Final

- [ ] IP de PC obtenida
- [ ] Archivo `src/config/api.ts` actualizado
- [ ] Backend corriendo (`npm run dev`)
- [ ] PC y teléfono en mismo WiFi
- [ ] Firewall Windows permite puerto 3000
- [ ] Expo Go recargado (botón R)
- [ ] Login intenta nuevamente

---

## 💡 Comando para Testear Conexión

En tu PC, abre terminal y ejecuta:
```bash
curl http://localhost:3000/api/v1/machines/getAll
```

Si funciona, verás un JSON. Si tu app sigue sin funcionar, el problema es exclusivamente por IP incorrecta.

---

**¿Aún tienes problemas?** Asegúrate de que:
1. El comando anterior funcione en tu PC
2. Tu teléfono pueda hacer ping a tu PC: `ping 192.168.X.X`
3. El puerto 3000 está correctamente abierto en el firewall
