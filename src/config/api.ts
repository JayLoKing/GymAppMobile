/**
 * URL base del backend (MIS: React + Node.js + MySQL).
 * Para pruebas en dispositivo físico con Expo Go, usa la IP de tu PC, ej: http://192.168.1.10:3000/api
 */
export const API_BASE_URL =
  (typeof process !== 'undefined' &&
    (process as unknown as { env?: { EXPO_PUBLIC_API_URL?: string } }).env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000/api';
