export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento: string;
  genero: 'Masculino' | 'Femenino';
  condicionesMedicas?: string;
  medicamentos?: string;
  lesiones?: string;
  nivelActividad: NivelActividad;
  objetivos?: string;
  parqAprobado: boolean;
  consentimientoFirmado: boolean;
  entrenadorId: number;
  creadoEn: string;
  activo: boolean;
  fotoPerfil?: string;
}

export type ClienteCreate = Omit<Cliente, 'id' | 'entrenadorId' | 'creadoEn' | 'activo'>;
