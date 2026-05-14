export interface ClientData {
  nombre?: string;
  edad: number;
  peso: number;
  estatura: number;
  genero: 'Masculino' | 'Femenino';
  grasaEstimada: number;
  grasaObjetivo: number;
  multiplicadorActividad: number;
  ajusteCalorico: number;
  distribucionCarbs: number;
  distribucionProteinas: number;
  distribucionGrasas: number;
}

export interface FitnessResults {
  imc: number;
  clasificacionIMC: string;
  masaLibreGrasa: number;
  masaGrasa: number;
  diferenciaPesoEstatura: number;

  tmb: number;
  caloriasMantenimiento: number;
  caloriasAjustadas: number;
  caloriasAjusteDiario: number;
  caloriasAjusteSemanal: number;
  caloriasSemanales: number;

  kilosPorBajar: number;
  reduccionSemanalMin: number;
  reduccionSemanalMax: number;
  perdidaSemanalSegunDeficit: number;
  diasParaLlegarObjetivo: number;

  gramosCarbs: number;
  gramosProteinas: number;
  gramosGrasas: number;
  proteinasPorKgPeso: number;
  proteinasPorKgMLG: number;

  diasRefeed: number;
  deficitPromedioConRefeed: number;

  alertas: string[];

  clientData: ClientData;
}
