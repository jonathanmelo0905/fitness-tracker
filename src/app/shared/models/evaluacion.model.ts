export interface Evaluacion {
  id: number;
  clienteId: number;
  fecha: string;
  peso: number;
  estatura: number;
  // pliegues
  pectoral?: number;
  abdominal?: number;
  musloAnterior?: number;
  triceps?: number;
  suprailiaco?: number;
  subescapular?: number;
  axilarMedio?: number;
  pantorrilla?: number;
  biceps?: number;
  supraespinal?: number;
  formulaPliegues?: string;
  // perímetros
  cintura?: number;
  cadera?: number;
  pecho?: number;
  brazo?: number;
  muslo?: number;
  pantorrillaPer?: number;
  // resultados
  porcentajeGrasa?: number;
  masaGrasaKg?: number;
  masaLibreGrasaKg?: number;
  imc?: number;
  notas?: string;
  creadoEn: string;
}

export type EvaluacionCreate = Omit<Evaluacion, 'id' | 'creadoEn'>;

export interface Medida {
  id: number;
  clienteId: number;
  fecha: string;
  peso?: number;
  porcentajeGrasa?: number;
  cintura?: number;
  cadera?: number;
  pecho?: number;
  brazo?: number;
  muslo?: number;
  pantorrilla?: number;
  notas?: string;
  creadoEn: string;
}

export type MedidaCreate = Omit<Medida, 'id' | 'creadoEn'>;

export interface FotoEvolucion {
  id: number;
  clienteId: number;
  url: string;
  fecha: string;
  notas?: string;
  creadoEn: string;
}
