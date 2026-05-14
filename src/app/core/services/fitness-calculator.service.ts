import { Injectable } from '@angular/core';
import { ClientData, FitnessResults } from '../../shared/models/client.model';

@Injectable({ providedIn: 'root' })
export class FitnessCalculatorService {

  getValoresDefault(): ClientData {
    return {
      nombre: 'Cliente Ejemplo',
      edad: 31,
      peso: 85,
      estatura: 1.77,
      genero: 'Masculino',
      grasaEstimada: 0.25,
      grasaObjetivo: 0.12,
      multiplicadorActividad: 1.55,
      ajusteCalorico: -0.25,
      distribucionCarbs: 0.40,
      distribucionProteinas: 0.30,
      distribucionGrasas: 0.30,
    };
  }

  calcular(data: ClientData): FitnessResults {
    const estaturasCm = data.estatura * 100;

    // --- 1. IMC ---
    const imc = data.peso / (data.estatura * data.estatura);

    // --- 2. Clasificación IMC ---
    let clasificacionIMC: string;
    if (imc < 18.5) clasificacionIMC = 'Muy delgado';
    else if (imc < 20) clasificacionIMC = 'Delgado';
    else if (imc < 25) clasificacionIMC = 'Normal';
    else if (imc < 30) clasificacionIMC = 'Sobre peso';
    else clasificacionIMC = 'Obesidad';

    // --- 3. Diferencia peso-estatura ---
    const diferenciaPesoEstatura = data.peso - (data.estatura * 100 - 100);

    // --- 4. Masa grasa y masa libre de grasa ---
    const masaGrasa = data.peso * data.grasaEstimada;
    const masaLibreGrasa = data.peso - masaGrasa;

    // --- 5. TMB (Mifflin-St Jeor con ajuste para coincidir con Excel) ---
    // Base: (10 * peso) + (6.25 * estatura_cm) - (5 * edad) ± constante de genero
    const tmbBase = (10 * data.peso) + (6.25 * estaturasCm) - (5 * data.edad);
    const tmb = data.genero === 'Masculino' ? tmbBase + 5 : tmbBase - 161;

    // --- 6. Calorías de mantenimiento ---
    const caloriasMantenimiento = tmb * data.multiplicadorActividad;

    // --- 7. Calorías ajustadas con déficit/superávit ---
    const caloriasAjustadas = caloriasMantenimiento * (1 + data.ajusteCalorico);

    // --- 8. Ajuste calórico diario y semanal ---
    const caloriasAjusteDiario = caloriasMantenimiento * data.ajusteCalorico;
    const caloriasAjusteSemanal = caloriasAjusteDiario * 7;
    const caloriasSemanales = caloriasAjustadas * 7;

    // --- 9. Proyección pérdida de grasa ---
    // Peso objetivo = MLG / (1 - %grasa_objetivo), luego kilos por bajar = peso - peso_objetivo
    const pesoObjetivo = masaLibreGrasa / (1 - data.grasaObjetivo);
    const kilosPorBajar = Math.max(0, data.peso - pesoObjetivo);

    // --- 10. Rango de reducción semanal recomendada ---
    const reduccionSemanalMin = data.peso * 0.005;
    const reduccionSemanalMax = data.peso * 0.010;

    // --- 11. Pérdida semanal según déficit ---
    // Factor 6724 kcal/kg de tejido graso mixto (derivado del Excel)
    const KCAL_POR_KG_TEJIDO = 6724;
    const perdidaSemanalSegunDeficit = Math.abs(caloriasAjusteSemanal) / KCAL_POR_KG_TEJIDO;

    // --- 12. Días para llegar al objetivo ---
    const diasParaLlegarObjetivo = caloriasAjusteDiario !== 0
      ? (kilosPorBajar * KCAL_POR_KG_TEJIDO) / Math.abs(caloriasAjusteDiario)
      : 0;

    // --- 13. Macros en gramos ---
    const gramosCarbs = (caloriasAjustadas * data.distribucionCarbs) / 4;
    const gramosProteinas = (caloriasAjustadas * data.distribucionProteinas) / 4;
    const gramosGrasas = (caloriasAjustadas * data.distribucionGrasas) / 9;
    const proteinasPorKgPeso = gramosProteinas / data.peso;
    const proteinasPorKgMLG = gramosProteinas / masaLibreGrasa;

    // --- 14. Refeeds ---
    const deficitPorcentaje = Math.abs(data.ajusteCalorico) * 100;
    const diasRefeed = deficitPorcentaje > 25 ? 2 : deficitPorcentaje > 20 ? 1 : 0;
    const deficitPromedioConRefeed =
      diasRefeed === 1 ? (deficitPorcentaje * 6) / 7 :
      diasRefeed === 2 ? (deficitPorcentaje * 5) / 7 :
      deficitPorcentaje;

    // --- 15. Alertas de negocio ---
    const alertas: string[] = [];
    if (Math.abs(data.ajusteCalorico) > 0.30)
      alertas.push('⚠️ Déficit mayor al 30% puede causar pérdida muscular significativa');
    if (perdidaSemanalSegunDeficit > reduccionSemanalMax)
      alertas.push('⚠️ La pérdida semanal proyectada supera el rango recomendado (1% del peso)');
    if (proteinasPorKgMLG < 1.8)
      alertas.push('⚠️ Proteína por kg de MLG está por debajo del mínimo recomendado (1.8g)');
    if (data.grasaObjetivo < 0.08 && data.genero === 'Masculino')
      alertas.push('⚠️ % grasa objetivo muy bajo para hombre (mínimo saludable ~8%)');
    if (data.grasaObjetivo < 0.15 && data.genero === 'Femenino')
      alertas.push('⚠️ % grasa objetivo muy bajo para mujer (mínimo saludable ~15%)');

    return {
      imc, clasificacionIMC, masaLibreGrasa, masaGrasa, diferenciaPesoEstatura,
      tmb, caloriasMantenimiento, caloriasAjustadas,
      caloriasAjusteDiario, caloriasAjusteSemanal, caloriasSemanales,
      kilosPorBajar, reduccionSemanalMin, reduccionSemanalMax,
      perdidaSemanalSegunDeficit, diasParaLlegarObjetivo,
      gramosCarbs, gramosProteinas, gramosGrasas,
      proteinasPorKgPeso, proteinasPorKgMLG,
      diasRefeed, deficitPromedioConRefeed,
      alertas,
      clientData: data,
    };
  }
}
