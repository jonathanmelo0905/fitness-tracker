export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento: string;        // ISO date — "YYYY-MM-DD"
  genero: 'Masculino' | 'Femenino';
  pesoInicial?: number;           // kg — línea base onboarding
  estatura?: number;                // cm — línea base onboarding
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

// JSONB payloads — POST /api/clientes (CLAUDE.md §14)
export interface SaludInfo {
  enfermedades?: string;
  medicamentos?: string;
  lesiones?: string;
  cirugias?: string;
  restricciones?: string;
}

export interface HabitosInfo {
  sueno?: number;       // horas/día
  estres?: number;      // 1–10
  agua?: number;        // litros/día
  pasos_diarios?: number;
}

// Matches POST /api/clientes request body (CLAUDE.md §14)
export interface ClienteCreate {
  nombre: string;            // nombre completo: firstName + ' ' + lastName
  email: string;
  fechaNacimiento: string;   // YYYY-MM-DD
  sexo: string;
  telefono?: string;
  pesoInicial?: number;
  estatura?: number;
  objetivo?: string;
  nivel?: string;
  salud?: SaludInfo;
  habitos?: HabitosInfo;
  parqAprobado?: boolean;
  consentimientoFirmado?: boolean;
  passwordTemporal?: string;
}

// Calcula cuántos pasos del onboarding están completados (se usa en lista y detalle)
export interface OnboardingStatus {
  completados: number;
  total: number;
  pasos: boolean[];
}

export function calcularOnboarding(c: Cliente, tieneEvaluacion = false, tieneSesion = false): OnboardingStatus {
  const pasos = [
    !!(c.nombre && c.apellido && c.email),
    !!(c.pesoInicial && c.estatura),
    !!(c.fotoPerfil),
    tieneEvaluacion,
    tieneSesion,
    !!c.parqAprobado,
    !!c.consentimientoFirmado,
  ];
  return { completados: pasos.filter(Boolean).length, total: 7, pasos };
}
