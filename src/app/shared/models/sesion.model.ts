export type EstadoSesion = 'programada' | 'completada' | 'cancelada';
export type TipoSesion = 'entrenamiento' | 'evaluacion' | 'nutricion' | 'seguimiento';

export interface Sesion {
  id: number;
  clienteId: number;
  clienteNombre?: string;
  fecha: string;
  duracionMin: number;
  tipo: TipoSesion;
  estado: EstadoSesion;
  notas?: string;
  creadoEn: string;
}

export interface SesionCreate {
  clienteId: number;
  fecha: string;
  duracionMin: number;
  tipo: TipoSesion;
  estado?: EstadoSesion;
  notas?: string;
}
