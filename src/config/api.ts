/**
 * IMPORTANTE: Para conectarte desde un dispositivo físico con Expo Go:
 * 
 * 1. Obtén la IP de tu PC:
 *    - Windows CMD: ipconfig | find "IPv4"
 *    - Linux/Mac: ifconfig | grep "inet "
 * 
 * 2. Asegúrate que:
 *    - Tu PC y teléfono están en la MISMA RED (WiFi)
 *    - El backend está corriendo en tu PC: http://localhost:3000
 *    - El puerto 3000 no está bloqueado por firewall
 * 
 * 3. Reemplaza TU_IP_LOCAL con tu IP real (ej: 192.168.1.100)
 */

// ⚙️ CAMBIAR ESTA URL SEGÚN TU ENTORNO
const API_URL = 'http://192.168.1.155/api/v1'; // ← CAMBIA ESTO A TU IP

export const API_BASE_URL =
  (typeof process !== 'undefined' &&
    (process as unknown as { env?: { EXPO_PUBLIC_API_URL?: string } }).env?.EXPO_PUBLIC_API_URL) ||
  API_URL;

export const API_V1_URL = API_BASE_URL;

// DEBUG: Muestra la URL en consola para verificar
console.log('🔗 API Base URL:', API_BASE_URL);
