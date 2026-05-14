import { Injectable } from '@angular/core';
import {
  PhysicalEvaluationInput, PhysicalEvaluationResults,
  SkinfoldData, GirthData, BoneDiameterData, FitnessTestData,
} from '../../shared/models/physical-evaluation.model';

@Injectable({ providedIn: 'root' })
export class PhysicalEvaluationService {

  calcular(input: PhysicalEvaluationInput): PhysicalEvaluationResults {
    const r: PhysicalEvaluationResults = { alertas: [] };
    const es = input.estatura * 100; // estatura en cm
    const esHombre = input.genero === 'Masculino';

    // ── Pliegues cutáneos ─────────────────────────────────────────────────────
    if (input.skinfolds) {
      this.calcularPliegues(r, input.skinfolds, input.edad, input.peso, esHombre);
    }

    // ── Perímetros ────────────────────────────────────────────────────────────
    if (input.girths) {
      this.calcularPerimetros(r, input.girths, es, esHombre);
    }

    // ── Complexión y peso ideal ───────────────────────────────────────────────
    this.calcularComplexionYPesoIdeal(r, input, es, esHombre);

    // ── Somatotipo Heath-Carter ───────────────────────────────────────────────
    this.calcularSomatotipo(r, input, es);

    // ── Tests físicos ─────────────────────────────────────────────────────────
    if (input.fitnessTests) {
      this.calcularTests(r, input.fitnessTests, input.peso, input.edad, esHombre);
    }

    // ── Alertas ───────────────────────────────────────────────────────────────
    this.generarAlertas(r, esHombre);

    return r;
  }

  // ─── Pliegues cutáneos ──────────────────────────────────────────────────────
  private calcularPliegues(
    r: PhysicalEvaluationResults,
    s: SkinfoldData,
    edad: number,
    peso: number,
    esHombre: boolean,
  ): void {
    let dc: number | undefined;
    let formulaUsada: string | undefined;

    if (s.formula === 'jackson3') {
      if (esHombre && s.pectoral && s.abdominal && s.musloAnterior) {
        // Jackson & Pollock 3 pliegues — hombre: pectoral + abdominal + musloAnterior
        const S = s.pectoral + s.abdominal + s.musloAnterior;
        dc = 1.10938 - (0.0008267 * S) + (0.0000016 * S * S) - (0.0002574 * edad);
        formulaUsada = 'Jackson-Pollock 3 pliegues (H)';
      } else if (!esHombre && s.triceps && s.suprailiaco && s.musloAnterior) {
        // Jackson & Pollock 3 pliegues — mujer: triceps + suprailiaco + musloAnterior
        const S = s.triceps + s.suprailiaco + s.musloAnterior;
        dc = 1.0994921 - (0.0009929 * S) + (0.0000023 * S * S) - (0.0001392 * edad);
        formulaUsada = 'Jackson-Pollock 3 pliegues (M)';
      }
    } else if (s.formula === 'jackson7') {
      const sum = [s.pectoral, s.axilarMedio, s.triceps, s.subescapular, s.abdominal, s.suprailiaco, s.musloAnterior];
      if (sum.every(v => v !== undefined && v > 0)) {
        // Jackson & Pollock 7 pliegues
        const S = sum.reduce<number>((a, b) => a + (b ?? 0), 0);
        if (esHombre) {
          dc = 1.112 - (0.00043499 * S) + (0.00000055 * S * S) - (0.00028826 * edad);
        } else {
          dc = 1.097 - (0.00046971 * S) + (0.00000056 * S * S) - (0.00012828 * edad);
        }
        formulaUsada = `Jackson-Pollock 7 pliegues (${esHombre ? 'H' : 'M'})`;
      }
    } else if (s.formula === 'durnin4') {
      if (s.biceps && s.triceps && s.subescapular && s.suprailiaco) {
        // Durnin & Womersley 4 pliegues: DC = A - B × log10(suma)
        const S = s.biceps + s.triceps + s.subescapular + s.suprailiaco;
        const [A, B] = this.durninTable(edad, esHombre);
        dc = A - B * Math.log10(S);
        formulaUsada = `Durnin-Womersley 4 pliegues (${esHombre ? 'H' : 'M'})`;
      }
    }

    if (dc !== undefined && dc > 0) {
      // Siri: %GC = (4.95/DC - 4.50) × 100
      const pct = (4.95 / dc - 4.50) * 100;
      r.densidadCorporal      = Math.round(dc * 10000) / 10000;
      r.porcentajeGrasaPliegues = Math.round(pct * 10) / 10;
      r.masaGrasaKg           = Math.round(peso * (pct / 100) * 10) / 10;
      r.masaLibreGrasaKg      = Math.round((peso - r.masaGrasaKg) * 10) / 10;
      r.formulaUsada          = formulaUsada;
    }
  }

  // Tabla de constantes Durnin-Womersley por edad y género
  private durninTable(edad: number, esHombre: boolean): [number, number] {
    if (esHombre) {
      if (edad < 20) return [1.1620, 0.0630];
      if (edad < 30) return [1.1631, 0.0632];
      if (edad < 40) return [1.1422, 0.0544];
      if (edad < 50) return [1.1620, 0.0700];
      return [1.1715, 0.0779];
    } else {
      if (edad < 20) return [1.1549, 0.0678];
      if (edad < 30) return [1.1599, 0.0717];
      if (edad < 40) return [1.1423, 0.0632];
      if (edad < 50) return [1.1333, 0.0612];
      return [1.1339, 0.0645];
    }
  }

  // ─── Perímetros ─────────────────────────────────────────────────────────────
  private calcularPerimetros(
    r: PhysicalEvaluationResults,
    g: GirthData,
    esCm: number,
    esHombre: boolean,
  ): void {
    // ICC = cintura / cadera
    if (g.cintura && g.cadera) {
      const icc = g.cintura / g.cadera;
      r.indiceCinturaCadera = Math.round(icc * 100) / 100;
      if (esHombre) {
        r.clasificacionICCadera = icc < 0.90 ? 'Bajo riesgo' : icc < 1.0 ? 'Riesgo moderado' : 'Riesgo alto';
      } else {
        r.clasificacionICCadera = icc < 0.80 ? 'Bajo riesgo' : icc < 0.85 ? 'Riesgo moderado' : 'Riesgo alto';
      }
    }

    // ICE = cintura / estatura_cm
    if (g.cintura) {
      const ice = g.cintura / esCm;
      r.indiceCinturaEstatura = Math.round(ice * 100) / 100;
      r.riesgoCardiovascular  = ice < 0.5 ? 'Bajo' : ice < 0.6 ? 'Moderado' : 'Alto';
    }

    // US Navy method
    if (g.cuello && g.cintura) {
      let pct: number;
      if (esHombre) {
        // %G = 495/(1.0324 - 0.19077×log10(cintura-cuello) + 0.15456×log10(estatura_cm)) - 450
        const logCC = Math.log10(g.cintura - g.cuello);
        const logE  = Math.log10(esCm);
        pct = 495 / (1.0324 - 0.19077 * logCC + 0.15456 * logE) - 450;
      } else if (g.cadera) {
        // %G = 495/(1.29579 - 0.35004×log10(cintura+cadera-cuello) + 0.22100×log10(estatura_cm)) - 450
        const logCCC = Math.log10(g.cintura + g.cadera - g.cuello);
        const logE   = Math.log10(esCm);
        pct = 495 / (1.29579 - 0.35004 * logCCC + 0.22100 * logE) - 450;
      } else {
        return;
      }
      r.porcentajeGrasaPerimetros = Math.round(Math.max(0, pct) * 10) / 10;
    }
  }

  // ─── Complexión y peso ideal (Hamwi) ────────────────────────────────────────
  private calcularComplexionYPesoIdeal(
    r: PhysicalEvaluationResults,
    input: PhysicalEvaluationInput,
    esCm: number,
    esHombre: boolean,
  ): void {
    // Complexión usando muñeca (boneDiameters.muneca)
    if (input.boneDiameters?.muneca) {
      const ratio = esCm / input.boneDiameters.muneca;
      if (esHombre) {
        r.complexion = ratio > 10.4 ? 'Pequeña' : ratio >= 9.6 ? 'Mediana' : 'Grande';
      } else {
        r.complexion = ratio > 11.0 ? 'Pequeña' : ratio >= 10.1 ? 'Mediana' : 'Grande';
      }
    }

    // Hamwi: 48kg (H) / 45.5kg (M) para 152.4cm, +2.7/+2.2 kg por cada 2.54cm adicional
    const exceso = (esCm - 152.4) / 2.54;
    const base   = esHombre ? 48.0 + 2.7 * exceso : 45.5 + 2.2 * exceso;
    r.pesoIdealMin = Math.round(base * 0.9 * 10) / 10;
    r.pesoIdealMax = Math.round(base * 1.1 * 10) / 10;
  }

  // ─── Somatotipo Heath-Carter ─────────────────────────────────────────────────
  private calcularSomatotipo(
    r: PhysicalEvaluationResults,
    input: PhysicalEvaluationInput,
    esCm: number,
  ): void {
    const s = input.skinfolds;
    const g = input.girths;
    const d = input.boneDiameters;

    if (!s?.triceps || !s?.subescapular || !s?.suprailiaco) return;

    // Endomorfia: X = (triceps+subescapular+suprailiaco) × (170.18/estatura_cm)
    const X = (s.triceps + s.subescapular + s.suprailiaco) * (170.18 / esCm);
    const endo = -0.7182 + 0.1451 * X - 0.00068 * X * X + 0.0000014 * Math.pow(X, 3);
    r.endomorfia = Math.max(0.1, Math.round(endo * 10) / 10);

    // Mesomorfia (requiere diámetros y perímetros)
    if (d?.codo && d?.rodilla && g?.brazoContraido && g?.pantorrillaDerecha) {
      // brazo_corregido = brazoContraido - triceps/10 (mm→cm)
      // pantorrilla_corregida = pantorrilla - pantorrilla_pliegue/10
      const brazoCorr = g.brazoContraido - (s.triceps / 10);
      const pantCorr  = g.pantorrillaDerecha - ((s.pantorrilla ?? 0) / 10);
      const meso = 0.858 * d.codo + 0.601 * d.rodilla
                 + 0.188 * brazoCorr + 0.161 * pantCorr
                 - esCm * 0.131 + 4.50;
      r.mesomorfia = Math.max(0.1, Math.round(meso * 10) / 10);
    }

    // Ectomorfia: IP = estatura_cm / peso^(1/3)
    const IP = esCm / Math.pow(input.peso, 1 / 3);
    let ecto: number;
    if (IP >= 40.75)      ecto = 0.732 * IP - 28.58;
    else if (IP >= 38.25) ecto = 0.463 * IP - 17.63;
    else                  ecto = 0.5;
    r.ectomorfia = Math.max(0.1, Math.round(ecto * 10) / 10);

    r.somatotipoDescripcion = this.describeSomatotipo(r.endomorfia, r.mesomorfia, r.ectomorfia);
  }

  private describeSomatotipo(
    endo: number | undefined,
    meso: number | undefined,
    ecto: number | undefined,
  ): string {
    if (!endo || !ecto) return 'Datos insuficientes';
    const vals: { label: string; v: number }[] = [
      { label: 'Endomorfo', v: endo },
      { label: 'Mesomorfo', v: meso ?? 0 },
      { label: 'Ectomorfo', v: ecto },
    ];
    vals.sort((a, b) => b.v - a.v);
    const max = vals[0].v;
    const diff = max - vals[1].v;
    if (diff < 1) return `Mesomorfo central (${endo}-${meso ?? '?'}-${ecto})`;
    if (diff < 2) return `${vals[0].label}-${vals[1].label} (${endo}-${meso ?? '?'}-${ecto})`;
    return `${vals[0].label} dominante (${endo}-${meso ?? '?'}-${ecto})`;
  }

  // ─── Tests físicos ──────────────────────────────────────────────────────────
  private calcularTests(
    r: PhysicalEvaluationResults,
    t: FitnessTestData,
    peso: number,
    edad: number,
    esHombre: boolean,
  ): void {
    // Ruffier: I = ((FC_post-70) + (FC_rec-FC_rep)) / 10
    if (t.fc_reposo && t.fc_post_ejercicio && t.fc_recuperacion) {
      const I = ((t.fc_post_ejercicio - 70) + (t.fc_recuperacion - t.fc_reposo)) / 10;
      r.indiceRuffier = Math.round(I * 10) / 10;
      r.clasificacionRuffier =
        I < 0   ? 'Muy bueno'  :
        I < 5   ? 'Bueno'      :
        I < 10  ? 'Aceptable'  :
        I < 15  ? 'Débil'      : 'Muy débil';
    }

    // VO2max Rockport
    if (t.tiempo_milla_min !== undefined && t.fc_final_rockport) {
      const pesoLb = peso * 2.205;
      const t_min  = (t.tiempo_milla_min ?? 0) + ((t.tiempo_milla_seg ?? 0) / 60);
      const constante = esHombre ? 139.168 : 132.853;
      const vo2 = constante
        - (0.388 * edad)
        - (0.077 * pesoLb)
        - (3.265 * t_min)
        - (0.156 * t.fc_final_rockport);
      r.vo2max = Math.round(vo2 * 10) / 10;
      r.clasificacionVo2 =
        vo2 < 25 ? 'Muy bajo' :
        vo2 < 35 ? 'Bajo'     :
        vo2 < 45 ? 'Promedio' :
        vo2 < 55 ? 'Bueno'    : 'Excelente';
    }

    // 1RM Epley: peso × (1 + reps/30), solo para 2-10 reps
    if (t.peso_1rm && t.repeticiones_1rm && t.repeticiones_1rm >= 2 && t.repeticiones_1rm <= 10) {
      r.rm_estimado = Math.round(t.peso_1rm * (1 + t.repeticiones_1rm / 30) * 10) / 10;
    }
  }

  // ─── Alertas ────────────────────────────────────────────────────────────────
  private generarAlertas(r: PhysicalEvaluationResults, esHombre: boolean): void {
    if (r.porcentajeGrasaPliegues !== undefined) {
      if (esHombre && r.porcentajeGrasaPliegues > 30) r.alertas.push('⚠️ % grasa elevado para hombre');
      if (!esHombre && r.porcentajeGrasaPliegues > 38) r.alertas.push('⚠️ % grasa elevado para mujer');
    }
    if (r.indiceCinturaCadera !== undefined) {
      if (esHombre  && r.indiceCinturaCadera >= 1.0)  r.alertas.push('🔴 Alto riesgo cardiovascular (ICC)');
      if (!esHombre && r.indiceCinturaCadera >= 0.85) r.alertas.push('🔴 Alto riesgo cardiovascular (ICC)');
    }
    if (r.indiceCinturaEstatura !== undefined && r.indiceCinturaEstatura >= 0.6) {
      r.alertas.push('🔴 Riesgo metabólico elevado (ICE)');
    }
    if (r.vo2max !== undefined && r.vo2max < 35) {
      r.alertas.push('⚠️ VO2máx bajo');
    }
    if (r.indiceRuffier !== undefined && r.indiceRuffier > 15) {
      r.alertas.push('🔴 Índice Ruffier muy débil, consultar médico');
    }
  }

  getDefaultInput(): PhysicalEvaluationInput {
    return {
      edad: 0,
      peso: 0,
      estatura: 0,
      genero: 'Masculino',
      skinfolds: { formula: 'jackson3' },
      girths: {},
      boneDiameters: {},
      fitnessTests: {},
    };
  }
}
