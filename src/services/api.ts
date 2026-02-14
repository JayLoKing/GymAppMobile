import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { Maquina, UsoActivo } from '../types/models';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Obtiene las máquinas (opcional: solo disponibles).
 */
export async function getMaquinas(disponibles?: boolean): Promise<Maquina[]> {
  const { data } = await client.get<Maquina[]>('/maquinas', {
    params: disponibles != null ? { disponibles } : undefined,
  });
  return data;
}

/**
 * Obtiene una máquina por ID.
 */
export async function getMaquinaById(id: number): Promise<Maquina> {
  const { data } = await client.get<Maquina>(`/maquinas/${id}`);
  return data;
}

/**
 * Registra uso activo: usuario escanea QR y "bloquea" la máquina.
 * El QR puede enviar maquina_id o un código; el backend debe resolverlo.
 */
export async function iniciarUso(maquinaId: number, usuarioId?: number): Promise<UsoActivo> {
  const { data } = await client.post<UsoActivo>('/uso-activo', {
    maquina_id: maquinaId,
    usuario_id: usuarioId,
  });
  return data;
}

/**
 * Finaliza el uso y libera la máquina (mueve a historial_uso).
 */
export async function terminarUso(usoActivoId: number): Promise<void> {
  await client.delete(`/uso-activo/${usoActivoId}`);
}

/**
 * Usos activos del usuario actual (máquinas que tiene "bloqueadas").
 */
export async function getMisUsosActivos(usuarioId?: number): Promise<UsoActivo[]> {
  const { data } = await client.get<UsoActivo[]>('/uso-activo', {
    params: usuarioId != null ? { usuario_id: usuarioId } : undefined,
  });
  return data;
}
