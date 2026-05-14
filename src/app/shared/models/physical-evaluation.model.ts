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
  supraespinal?: number;
  formula: 'jackson3' | 'jackson7' | 'durnin4' | 'yuhasz';
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
  antebrazo?: number;
  tobillo?: number;
  pierna?: number;
}

export interface BoneDiameterData {
  muneca?: number;                 // mantenido para compatibilidad
  biepicondilarHumero?: number;    // ancho del codo (cm)
  biestiloideo?: number;           // ancho de la muñeca (cm)
  biepicondilarFemur?: number;     // ancho de la rodilla (cm)
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

  // Yuhasz (1974)
  porcentajeGrasaYuhasz?: number;
  sumaPlieguesYuhasz?: number;

  // Composición 4 componentes — Drinkwater & Ross (1980)
  pesoGrasaKg?: number;
  pesoMuscularKg?: number;
  pesoOseoKg?: number;
  pesoResidualKg?: number;
  porcentajeGrasa4C?: number;
  porcentajeMuscular?: number;
  porcentajeOseo?: number;
  porcentajeResidual?: number;

  // Pesos ideales
  pesoIdealDikovics?: number;
  pesoIdealLorents?: number;

  // Índices adicionales
  pesoAModificar?: number;
  excesoGrasaKg?: number;
  excesoCalorico?: number;
  indiceAKS?: number;
  clasificacionAKS?: string;
  masaCorporalActiva?: number;
  tmb24hrs?: number;
  grasaIdealPorcentaje?: number;
}
