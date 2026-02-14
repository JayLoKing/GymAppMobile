/**
 * Tipos alineados con la base de datos railway:
 * usuarios, maquinas, uso_activo, historial_uso, ejercicios
 */

export interface Usuario {
  id: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  created_at?: string;
}

export interface Maquina {
  id: number;
  nombre: string;
  tipo?: string;
  ubicacion?: string;
  codigo_qr?: string;
  estado?: 'disponible' | 'en_uso' | 'mantenimiento';
}

export interface UsoActivo {
  id: number;
  usuario_id: number;
  maquina_id: number;
  fecha_inicio: string;
  maquina?: Maquina;
  usuario?: Usuario;
}

export interface HistorialUso {
  id: number;
  usuario_id: number;
  maquina_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_minutos?: number;
}
