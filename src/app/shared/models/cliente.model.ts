export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento: string;        // ISO date — "YYYY-MM-DD"
  genero: 'Masculino' | 'Femenino';
  pesoInicial?: number;           // kg — línea base onboarding
  altura?: number;                // cm — línea base onboarding
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

// Calcula cuántos pasos del onboarding están completados (se usa en lista y detalle)
export interface OnboardingStatus {
  completados: number;
  total: number;
  pasos: boolean[];
}

export function calcularOnboarding(c: Cliente, tieneEvaluacion = false, tieneSesion = false): OnboardingStatus {
  const pasos = [
    !!(c.nombre && c.apellido && c.email),
    !!(c.pesoInicial && c.altura),
    !!(c.fotoPerfil),
    tieneEvaluacion,
    tieneSesion,
    !!c.parqAprobado,
    !!c.consentimientoFirmado,
  ];
  return { completados: pasos.filter(Boolean).length, total: 7, pasos };
}
