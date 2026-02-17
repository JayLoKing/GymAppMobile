import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import type { Maquina, UsoActivo } from '../types/models';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token a cada request
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo de errores
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Mejora los mensajes de error
    if (!error.response) {
      // Error de red
      const networkError = new Error(
        'Error de conexión. Verifica que:\n' +
        '1. Tu PC está en ejecución\n' +
        '2. El backend está corriendo (eslint:3000)\n' +
        '3. Tu teléfono y PC están en la MISMA WIFI\n' +
        '4. La URL de API es correcta en src/config/api.ts'
      );
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  }
);

/**
 * POST /auth/login - Iniciar sesión
 */
export async function login(email: string, password: string): Promise<{
  token: string;
  user: { id: number; nombre: string; email: string; rol: string };
}> {
  const { data } = await client.post('/auth/login', { email, password });
  
  // Guardar token en AsyncStorage
  if (data.token) {
    await AsyncStorage.setItem('authToken', data.token);
  }
  
  return data;
}

/**
 * POST /auth/register - Registrar usuario
 */
export async function register(
  nombre: string,
  email: string,
  password: string,
  rol: string = 'usuario'
): Promise<{ token: string; user: any }> {
  const { data } = await client.post('/auth/register', {
    nombre,
    email,
    password,
    rol,
  });

  if (data.token) {
    await AsyncStorage.setItem('authToken', data.token);
  }

  return data;
}

/**
 * POST /auth/logout - Cerrar sesión
 */
export async function logout(): Promise<void> {
  await client.post('/auth/logout');
  await AsyncStorage.removeItem('authToken');
}

/**
 * GET /auth/profile - Obtener perfil actual
 */
export async function getProfile(): Promise<{
  id: number;
  nombre: string;
  email: string;
  rol: string;
}> {
  const { data } = await client.get('/auth/profile');
  return data;
}

/**
 * GET /machines/getAll - Obtener todas las máquinas
 */
export async function getMaquinas(): Promise<Maquina[]> {
  const { data } = await client.get<Maquina[]>('/machines/getAll');
  return data;
}

/**
 * GET /machines/get/:id - Obtener máquina por ID
 */
export async function getMaquinaById(id: number): Promise<Maquina> {
  const { data } = await client.get<Maquina>(`/machines/get/${id}`);
  return data;
}

/**
 * GET /machines/disponibles - Obtener máquinas disponibles
 */
export async function getMaquinasDisponibles(): Promise<Maquina[]> {
  const { data } = await client.get<Maquina[]>('/machines/disponibles');
  return data;
}

/**
 * POST /usos/iniciar - Iniciar uso de máquina
 */
export async function iniciarUso(maquinaId: number): Promise<UsoActivo> {
  const { data } = await client.post<UsoActivo>('/usos/iniciar', {
    maquina_id: maquinaId,
  });
  return data;
}

/**
 * PUT /usos/finalizar/:id - Finalizar uso de máquina
 */
export async function finalizarUso(usoId: number): Promise<void> {
  await client.put(`/usos/finalizar/${usoId}`);
}

/**
 * GET /usos/mis-activos - Obtener mis usos activos
 */
export async function getMisUsosActivos(): Promise<UsoActivo[]> {
  const { data } = await client.get<UsoActivo[]>('/usos/mis-activos');
  return data;
}

/**
 * GET /usos/activos - Obtener todos los usos activos (Admin)
 */
export async function getTodosUsosActivos(): Promise<UsoActivo[]> {
  const { data } = await client.get<UsoActivo[]>('/usos/activos');
  return data;
}

/**
 * GET /usos/historial - Obtener mi historial de usos
 */
export async function getMiHistorial(): Promise<any[]> {
  const { data } = await client.get('/usos/historial');
  return data;
}

/**
 * GET /statistics/summary - Resumen general de estadísticas
 */
export async function getEstadisticas(): Promise<{
  total_maquinas: number;
  disponibles: number;
  en_uso: number;
  mantenimiento: number;
  usuarios_activos: number;
}> {
  const { data } = await client.get('/statistics/summary');
  return data;
}

export default client;
