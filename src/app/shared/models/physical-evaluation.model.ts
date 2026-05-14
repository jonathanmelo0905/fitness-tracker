export interface SkinfoldData {
  pectoral?: number;
  abdominal?: number;
  musloAnterior?: number;
  triceps?: number;
  suprailiaco?: number;
  subescapular?: number;
  axilarMedio?: number;
  pantorrilla?: number;
  biceps?: number;
  formula: 'jackson3' | 'jackson7' | 'durnin4';
}

export interface GirthData {
  cuello?: number;
  hombros?: number;
  pecho?: number;
  cintura?: number;
  cadera?: number;
  abdomen?: number;
  brazoDerecho?: number;
  brazoIzquierdo?: number;
  brazoContraido?: number;
  musloDerecho?: number;
  musloIzquierdo?: number;
  pantorrillaDerecha?: number;
  pantorrillaIzquierda?: number;
}

export interface BoneDiameterData {
  muneca?: number;
  codo?: number;
  rodilla?: number;
  tobillo?: number;
}

export interface FitnessTestData {
  fc_reposo?: number;
  fc_post_ejercicio?: number;
  fc_recuperacion?: number;
  tiempo_milla_min?: number;
  tiempo_milla_seg?: number;
  fc_final_rockport?: number;
  ejercicio_1rm?: string;
  peso_1rm?: number;
  repeticiones_1rm?: number;
}

export interface PhysicalEvaluationInput {
  nombre?: string;
  edad: number;
  peso: number;
  estatura: number;
  genero: 'Masculino' | 'Femenino';
  skinfolds?: SkinfoldData;
  girths?: GirthData;
  boneDiameters?: BoneDiameterData;
  fitnessTests?: FitnessTestData;
}

export interface PhysicalEvaluationResults {
  densidadCorporal?: number;
  porcentajeGrasaPliegues?: number;
  masaGrasaKg?: number;
  masaLibreGrasaKg?: number;
  formulaUsada?: string;
  indiceCinturaCadera?: number;
  clasificacionICCadera?: string;
  indiceCinturaEstatura?: number;
  riesgoCardiovascular?: string;
  porcentajeGrasaPerimetros?: number;
  complexion?: 'Pequeña' | 'Mediana' | 'Grande';
  pesoIdealMin?: number;
  pesoIdealMax?: number;
  endomorfia?: number;
  mesomorfia?: number;
  ectomorfia?: number;
  somatotipoDescripcion?: string;
  indiceRuffier?: number;
  clasificacionRuffier?: string;
  vo2max?: number;
  clasificacionVo2?: string;
  rm_estimado?: number;
  alertas: string[];
}
