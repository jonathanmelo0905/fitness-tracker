import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ClientData, FitnessResults } from '../../shared/models/client.model';
import { PhysicalEvaluationInput, PhysicalEvaluationResults } from '../../shared/models/physical-evaluation.model';

// ─── Constantes de diseño ───────────────────────────────────────────────────
const COLOR_VERDE  = [26,  107, 58]  as [number, number, number];
const COLOR_BLANCO = [255, 255, 255] as [number, number, number];
const COLOR_GRIS   = [245, 245, 245] as [number, number, number];
const COLOR_TEXTO  = [30,  30,  30]  as [number, number, number];
const COLOR_MEDIO  = [120, 120, 120] as [number, number, number];
const MARGEN       = 20;

// Después de llamar autoTable(doc, ...) el cursor queda en doc.lastAutoTable.finalY
function finalY(doc: jsPDF): number {
  return (doc as any).lastAutoTable?.finalY ?? 38;
}

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  async generarReporte(data: ClientData, results: FitnessResults): Promise<void> {
    const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    this.dibujarEncabezado(doc, data, fecha);
    this.seccionDatosCliente(doc, data);
    this.seccionComposicionCorporal(doc, results);
    this.seccionCalorias(doc, results);
    const cursorTrassMacros = this.seccionMacros(doc, data, results);

    let cursor = cursorTrassMacros;

    if (data.ajusteCalorico < 0) {
      cursor = this.seccionProyeccion(doc, results, cursor);
    }

    if (results.diasRefeed > 0) {
      cursor = this.seccionRefeeds(doc, results, data, cursor);
    }

    if (results.alertas.length > 0) {
      this.seccionAlertas(doc, results, cursor);
    }

    this.dibujarPiePaginas(doc, fecha);
    await this.guardarODescargar(doc, this.nombreArchivo(data));
  }

  // ─── Encabezado ───────────────────────────────────────────────────────────
  private dibujarEncabezado(doc: jsPDF, data: ClientData, fecha: string): void {
    const ancho = doc.internal.pageSize.getWidth();

    doc.setFillColor(...COLOR_VERDE);
    doc.rect(0, 0, ancho, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_BLANCO);
    doc.text('REPORTE NUTRICIONAL Y DE COMPOSICIÓN CORPORAL', ancho / 2, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const subtitulo = data.nombre ? `${data.nombre}  ·  ${fecha}` : `Fecha: ${fecha}`;
    doc.text(subtitulo, ancho / 2, 21, { align: 'center' });

    doc.setDrawColor(...COLOR_VERDE);
    doc.setLineWidth(0.5);
    doc.line(MARGEN, 32, ancho - MARGEN, 32);
  }

  // ─── Sección 1: Datos del cliente ─────────────────────────────────────────
  private seccionDatosCliente(doc: jsPDF, data: ClientData): void {
    const y = 38;
    this.titulo(doc, '1. Datos del Cliente', y);

    autoTable(doc, {
      startY: y + 8,
      margin: { left: MARGEN, right: MARGEN },
      head: [['Campo', 'Valor']],
      body: [
        ['Edad',               `${data.edad} años`],
        ['Peso',               `${this.fmt(data.peso)} kg`],
        ['Estatura',           `${this.fmt(data.estatura)} m`],
        ['Género',             data.genero],
        ['% Grasa actual',     this.pct(data.grasaEstimada)],
        ['% Grasa objetivo',   this.pct(data.grasaObjetivo)],
        ['Nivel de actividad', this.nivelLabel(data.multiplicadorActividad)],
        ['Ajuste calórico',    this.ajusteLabel(data.ajusteCalorico)],
      ],
      ...this.estilos(),
    });
  }

  // ─── Sección 2: Composición corporal ──────────────────────────────────────
  private seccionComposicionCorporal(doc: jsPDF, r: FitnessResults): void {
    const y = finalY(doc) + 10;
    this.titulo(doc, '2. Composición Corporal', y);

    autoTable(doc, {
      startY: y + 8,
      margin: { left: MARGEN, right: MARGEN },
      head: [['Indicador', 'Valor', 'Clasificación / Nota']],
      body: [
        ['IMC',                   `${this.fmt(r.imc)}`,               r.clasificacionIMC],
        ['Masa Libre de Grasa',   `${this.fmt(r.masaLibreGrasa)} kg`, `${this.pct(1 - r.clientData.grasaEstimada)} del peso total`],
        ['Masa Grasa',            `${this.fmt(r.masaGrasa)} kg`,      this.pct(r.clientData.grasaEstimada)],
        ['Diferencia peso–talla', `${r.diferenciaPesoEstatura > 0 ? '+' : ''}${this.fmt(r.diferenciaPesoEstatura)} kg`, ''],
      ],
      ...this.estilos(),
    });
  }

  // ─── Sección 3: Calorías ──────────────────────────────────────────────────
  private seccionCalorias(doc: jsPDF, r: FitnessResults): void {
    const y          = finalY(doc) + 10;
    const ajuste     = r.caloriasAjusteDiario;
    const signo      = ajuste > 0 ? '+' : '';
    this.titulo(doc, '3. Requerimientos Calóricos', y);

    autoTable(doc, {
      startY: y + 8,
      margin: { left: MARGEN, right: MARGEN },
      head: [['Concepto', 'Kcal / día']],
      body: [
        ['Tasa Metabólica Basal (TMB)',  `${Math.round(r.tmb)}`],
        ['Calorías de Mantenimiento',    `${Math.round(r.caloriasMantenimiento)}`],
        ['Calorías Objetivo',            `${Math.round(r.caloriasAjustadas)}`],
        ['Ajuste Diario',                `${signo}${Math.round(ajuste)}`],
        ['Ajuste Semanal',               `${signo}${Math.round(r.caloriasAjusteSemanal)}`],
      ],
      ...this.estilos(),
      didParseCell: (hook: any) => {
        if (hook.section !== 'body') return;
        if (hook.row.index === 2) {
          hook.cell.styles.fontStyle = 'bold';
          hook.cell.styles.textColor = COLOR_VERDE;
        }
        if (hook.row.index === 3 && ajuste < 0) {
          hook.cell.styles.textColor = [200, 50, 50];
        }
      },
    });
  }

  // ─── Sección 4: Macros — devuelve cursorY tras la nota ────────────────────
  private seccionMacros(doc: jsPDF, data: ClientData, r: FitnessResults): number {
    const y = finalY(doc) + 10;
    this.titulo(doc, '4. Distribución de Macronutrientes', y);

    autoTable(doc, {
      startY: y + 8,
      margin: { left: MARGEN, right: MARGEN },
      head: [['Macronutriente', '%', 'Gramos/día', 'g / kg peso']],
      body: [
        ['Carbohidratos', this.pct(data.distribucionCarbs),    `${this.fmt(r.gramosCarbs)} g`,    `${this.fmt(r.gramosCarbs / data.peso)}`],
        ['Proteínas',     this.pct(data.distribucionProteinas),`${this.fmt(r.gramosProteinas)} g`, `${this.fmt(r.proteinasPorKgPeso)}`],
        ['Grasas',        this.pct(data.distribucionGrasas),   `${this.fmt(r.gramosGrasas)} g`,   `${this.fmt(r.gramosGrasas / data.peso)}`],
      ],
      ...this.estilos(),
      didParseCell: (hook: any) => {
        if (hook.section === 'body' && hook.row.index === 1) {
          hook.cell.styles.fontStyle = 'bold';
        }
      },
    });

    const notaY = finalY(doc) + 5;
    const estado = r.proteinasPorKgMLG < 1.8 ? '⚠ Por debajo del mínimo' : '✓ Dentro del rango';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLOR_MEDIO);
    doc.text(
      `Proteína / kg MLG: ${this.fmt(r.proteinasPorKgMLG)} g/kg  —  Rango recomendado: 1.8 – 3.0 g/kg  (${estado})`,
      MARGEN, notaY
    );
    return notaY + 3;
  }

  // ─── Sección 5: Proyección ────────────────────────────────────────────────
  private seccionProyeccion(doc: jsPDF, r: FitnessResults, cursor: number): number {
    const y       = cursor + 10;
    const semanas = Math.round(r.diasParaLlegarObjetivo / 7);
    const meses   = (r.diasParaLlegarObjetivo / 30.4).toFixed(1);
    this.titulo(doc, '5. Proyección de Pérdida de Grasa', y);

    autoTable(doc, {
      startY: y + 8,
      margin: { left: MARGEN, right: MARGEN },
      head: [['Indicador', 'Valor']],
      body: [
        ['Kilos a perder para llegar al objetivo',  `${this.fmt(r.kilosPorBajar)} kg`],
        ['Pérdida semanal recomendada (0.5–1.0%)',  `${this.fmt(r.reduccionSemanalMin)} – ${this.fmt(r.reduccionSemanalMax)} kg/sem`],
        ['Pérdida semanal según plan actual',       `${this.fmt(r.perdidaSemanalSegunDeficit)} kg/sem`],
        ['Tiempo estimado para el objetivo',        `${Math.round(r.diasParaLlegarObjetivo)} días (~${semanas} sem / ~${meses} meses)`],
      ],
      ...this.estilos(),
    });

    return finalY(doc);
  }

  // ─── Sección 6: Refeeds ───────────────────────────────────────────────────
  private seccionRefeeds(doc: jsPDF, r: FitnessResults, data: ClientData, cursor: number): number {
    const y    = cursor + 10;
    const ancho = doc.internal.pageSize.getWidth() - MARGEN * 2;
    const deficitBase = Math.abs(data.ajusteCalorico) * 100;
    this.titulo(doc, '6. Refeeds Recomendados', y);

    const texto =
      `Se recomienda incluir ${r.diasRefeed} día${r.diasRefeed > 1 ? 's' : ''} de refeed por semana ` +
      `(volver a calorías de mantenimiento). Esto reduce el déficit promedio del ${this.fmt(deficitBase)}% ` +
      `al ${this.fmt(r.deficitPromedioConRefeed)}%, ayudando a mantener los niveles hormonales ` +
      `(leptina), preservar la masa muscular y mejorar la adherencia al plan.`;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXTO);
    const lineas = doc.splitTextToSize(texto, ancho);
    doc.text(lineas, MARGEN, y + 10);
    return y + 10 + lineas.length * 5;
  }

  // ─── Sección 7: Alertas ───────────────────────────────────────────────────
  private seccionAlertas(doc: jsPDF, r: FitnessResults, cursor: number): void {
    const y    = cursor + 10;
    const ancho = doc.internal.pageSize.getWidth() - MARGEN * 2 - 6;
    this.titulo(doc, '7. Alertas del Plan', y);

    let posY = y + 10;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 60, 0);

    for (const alerta of r.alertas) {
      const lineas = doc.splitTextToSize(`⚠  ${alerta.replace(/^⚠️\s*/, '')}`, ancho);
      doc.text(lineas, MARGEN + 4, posY);
      posY += lineas.length * 5 + 3;
    }
  }

  // ─── Pie de página ────────────────────────────────────────────────────────
  private dibujarPiePaginas(doc: jsPDF, fecha: string): void {
    const total = (doc as any).internal.getNumberOfPages();
    const ancho = doc.internal.pageSize.getWidth();
    const alto  = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(...COLOR_VERDE);
      doc.setLineWidth(0.3);
      doc.line(MARGEN, alto - 14, ancho - MARGEN, alto - 14);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLOR_MEDIO);
      doc.text(`Generado con Fitness Tracker — ${fecha}`, MARGEN, alto - 9);
      doc.text('Este reporte es orientativo. Consulta con un profesional de la salud.', MARGEN, alto - 5);
      doc.text(`Página ${i} de ${total}`, ancho - MARGEN, alto - 7, { align: 'right' });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private titulo(doc: jsPDF, texto: string, y: number): void {
    this.tituloColor(doc, texto, y, COLOR_VERDE);
  }

  private tituloColor(doc: jsPDF, texto: string, y: number, color: [number, number, number]): void {
    const ancho = doc.internal.pageSize.getWidth();
    doc.setFillColor(...color);
    doc.rect(MARGEN, y, ancho - MARGEN * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_BLANCO);
    doc.text(texto, MARGEN + 3, y + 5);
  }

  private estilos() {
    return {
      theme: 'grid' as const,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        font: 'helvetica',
        textColor: COLOR_TEXTO,
        lineColor: [220, 220, 220] as [number, number, number],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: COLOR_VERDE,
        textColor: COLOR_BLANCO,
        fontStyle: 'bold' as const,
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: COLOR_GRIS },
      columnStyles: { 0: { fontStyle: 'bold' as const } },
    };
  }

  private fmt(v: number, d = 2): string { return v.toFixed(d); }

  private pct(decimal: number): string {
    return `${Math.round(decimal * 100)}%`;
  }

  private ajusteLabel(ajuste: number): string {
    const p = Math.round(ajuste * 100);
    return p < 0 ? `${p}% (déficit)` : p > 0 ? `+${p}% (superávit)` : 'Sin ajuste (mantenimiento)';
  }

  private nivelLabel(mult: number): string {
    const m: Record<number, string> = {
      1.2:  'Sedentario (x1.2)',
      1.3:  'Ejercicio ligero 1–3 días/sem (x1.3)',
      1.4:  'Ejercicio moderado 3–5 días/sem (x1.4)',
      1.55: 'Ejercicio 4–5 días/sem (x1.55)',
      1.7:  'Ejercicio intenso 6–7 días/sem (x1.7)',
      1.9:  'Atleta / trabajo físico (x1.9)',
    };
    return m[mult] ?? `x${mult}`;
  }

  private async guardarODescargar(doc: jsPDF, nombre: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Extraer base64 sin el prefijo "data:application/pdf;base64,"
      const base64 = doc.output('datauristring').split(',')[1];

      await Filesystem.writeFile({
        path: nombre,
        data: base64,
        directory: Directory.Cache,
      });

      const { uri } = await Filesystem.getUri({
        directory: Directory.Cache,
        path: nombre,
      });

      await Share.share({
        title: 'Reporte Fitness',
        url: uri,
        dialogTitle: 'Compartir o guardar reporte',
      });
    } else {
      const blob   = doc.output('blob');
      const url    = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href     = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    }
  }

  // ─── Reporte Evaluación Física ─────────────────────────────────────────────
  async generarReporteEvaluacionFisica(
    inp: PhysicalEvaluationInput,
    r: PhysicalEvaluationResults,
  ): Promise<void> {
    const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const ancho = doc.internal.pageSize.getWidth();
    const COLOR_AZUL: [number, number, number] = [26, 74, 138];
    const imc      = inp.estatura > 0 ? inp.peso / (inp.estatura * inp.estatura) : 0;
    const imcClasif = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
    const pGrasa   = r.porcentajeGrasaPliegues ?? r.porcentajeGrasaPerimetros;

    // Encabezado
    doc.setFillColor(...COLOR_AZUL);
    doc.rect(0, 0, ancho, 28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_BLANCO);
    doc.text('EVALUACIÓN FÍSICA AVANZADA', ancho / 2, 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const sub = inp.nombre ? `${inp.nombre}  ·  ${fecha}` : `Fecha: ${fecha}`;
    doc.text(sub, ancho / 2, 21, { align: 'center' });
    doc.setDrawColor(...COLOR_AZUL);
    doc.setLineWidth(0.5);
    doc.line(MARGEN, 32, ancho - MARGEN, 32);

    // Sección 1: Datos básicos
    const y1 = 38;
    this.titulo(doc, '1. Datos del Evaluado', y1);
    autoTable(doc, {
      startY: y1 + 8, margin: { left: MARGEN, right: MARGEN },
      head: [['Campo', 'Valor']],
      body: [
        ['Nombre',   inp.nombre ?? '—'],
        ['Edad',     `${inp.edad} años`],
        ['Peso',     `${inp.peso} kg`],
        ['Estatura', `${inp.estatura} m`],
        ['Género',   inp.genero],
        ['Fórmula',  r.formulaUsada ?? '—'],
      ],
      ...this.estilos(),
    });

    // Sección 2: Composición corporal
    const y2 = finalY(doc) + 10;
    this.titulo(doc, '2. Composición Corporal', y2);
    const bodyComp: string[][] = [
      ['IMC', `${imc.toFixed(1)}`, imcClasif],
    ];
    if (pGrasa !== undefined) bodyComp.push(['% Grasa Corporal', `${pGrasa.toFixed(1)}%`, '']);
    if (r.masaGrasaKg !== undefined) bodyComp.push(['Masa Grasa', `${r.masaGrasaKg.toFixed(1)} kg`, '']);
    if (r.masaLibreGrasaKg !== undefined) bodyComp.push(['Masa Libre de Grasa', `${r.masaLibreGrasaKg.toFixed(1)} kg`, '']);
    autoTable(doc, {
      startY: y2 + 8, margin: { left: MARGEN, right: MARGEN },
      head: [['Indicador', 'Valor', 'Clasificación']],
      body: bodyComp,
      ...this.estilos(),
    });

    // Sección 3: Índices corporales
    if (r.indiceCinturaCadera !== undefined || r.indiceCinturaEstatura !== undefined || r.pesoIdealMin !== undefined) {
      const y3 = finalY(doc) + 10;
      this.titulo(doc, '3. Índices Corporales y Peso Ideal', y3);
      const bodyIdx: string[][] = [];
      if (r.indiceCinturaCadera !== undefined)
        bodyIdx.push(['ICC (Cintura/Cadera)', r.indiceCinturaCadera.toFixed(2), r.clasificacionICCadera ?? '']);
      if (r.indiceCinturaEstatura !== undefined)
        bodyIdx.push(['ICE (Cintura/Estatura)', r.indiceCinturaEstatura.toFixed(2), r.riesgoCardiovascular ?? '']);
      if (r.complexion !== undefined)
        bodyIdx.push(['Complexión ósea', r.complexion, '']);
      if (r.pesoIdealMin !== undefined && r.pesoIdealMax !== undefined) {
        bodyIdx.push([
          'Rango peso ideal',
          `${r.pesoIdealMin.toFixed(1)} – ${r.pesoIdealMax.toFixed(1)} kg`,
          inp.peso >= r.pesoIdealMin && inp.peso <= r.pesoIdealMax ? 'Dentro del rango' : 'Fuera del rango',
        ]);
      }
      autoTable(doc, {
        startY: y3 + 8, margin: { left: MARGEN, right: MARGEN },
        head: [['Indicador', 'Valor', 'Clasificación']],
        body: bodyIdx,
        ...this.estilos(),
      });
    }

    // Sección 4: Somatotipo
    if (r.endomorfia !== undefined) {
      const y4 = finalY(doc) + 10;
      this.titulo(doc, '4. Somatotipo Heath-Carter', y4);
      const bodySoma: string[][] = [
        ['Endomorfia', r.endomorfia.toFixed(1)],
        ['Mesomorfia', (r.mesomorfia ?? 0).toFixed(1)],
        ['Ectomorfia',  (r.ectomorfia ?? 0).toFixed(1)],
      ];
      if (r.somatotipoDescripcion) bodySoma.push(['Descripción', r.somatotipoDescripcion]);
      autoTable(doc, {
        startY: y4 + 8, margin: { left: MARGEN, right: MARGEN },
        head: [['Componente', 'Valor']],
        body: bodySoma,
        ...this.estilos(),
      });
    }

    // Sección 5: Tests físicos
    if (r.indiceRuffier !== undefined || r.vo2max !== undefined || r.rm_estimado !== undefined) {
      const y5 = finalY(doc) + 10;
      this.titulo(doc, '5. Tests Físicos', y5);
      const bodyTests: string[][] = [];
      if (r.indiceRuffier !== undefined)
        bodyTests.push(['Índice Ruffier', r.indiceRuffier.toFixed(1), r.clasificacionRuffier ?? '']);
      if (r.vo2max !== undefined)
        bodyTests.push(['VO₂máx Rockport', `${r.vo2max.toFixed(1)} ml/kg/min`, r.clasificacionVo2 ?? '']);
      if (r.rm_estimado !== undefined) {
        const ej   = inp.fitnessTests?.ejercicio_1rm ?? 'Ejercicio';
        const nota = inp.fitnessTests?.repeticiones_1rm && inp.fitnessTests?.peso_1rm
          ? `${inp.fitnessTests.repeticiones_1rm} reps × ${inp.fitnessTests.peso_1rm} kg`
          : '';
        bodyTests.push([`1RM Epley (${ej})`, `${r.rm_estimado.toFixed(1)} kg`, nota]);
      }
      autoTable(doc, {
        startY: y5 + 8, margin: { left: MARGEN, right: MARGEN },
        head: [['Test', 'Resultado', 'Clasificación']],
        body: bodyTests,
        ...this.estilos(),
      });
    }

    // Sección 6: Alertas
    let cursorFinal = finalY(doc);
    if (r.alertas.length > 0) {
      const y6   = cursorFinal + 10;
      const aw   = doc.internal.pageSize.getWidth() - MARGEN * 2 - 6;
      this.titulo(doc, '6. Alertas', y6);
      let posY = y6 + 10;
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 60, 0);
      for (const alerta of r.alertas) {
        const lineas = doc.splitTextToSize(`⚠  ${alerta}`, aw);
        doc.text(lineas, MARGEN + 4, posY);
        posY += lineas.length * 5 + 3;
      }
      cursorFinal = posY;
    }

    // ── Sección 7: Composición Corporal 4 Componentes ─────────────────────────
    if (
      r.pesoGrasaKg    !== undefined &&
      r.pesoMuscularKg !== undefined &&
      r.pesoOseoKg     !== undefined &&
      r.pesoResidualKg !== undefined
    ) {
      const COLOR_VERDE_4C: [number, number, number] = [26, 107, 58];
      const y7 = cursorFinal + 10;
      this.tituloColor(doc, '7. Composición Corporal 4 Componentes (Drinkwater & Ross)', y7, COLOR_VERDE_4C);
      const total = inp.peso;
      autoTable(doc, {
        startY: y7 + 8, margin: { left: MARGEN, right: MARGEN },
        head: [['Componente', 'Peso (kg)', 'Porcentaje']],
        body: [
          ['Grasa',    `${r.pesoGrasaKg.toFixed(1)}`,    `${r.porcentajeGrasa4C?.toFixed(1)}%`],
          ['Muscular', `${r.pesoMuscularKg.toFixed(1)}`,  `${r.porcentajeMuscular?.toFixed(1)}%`],
          ['Óseo',     `${r.pesoOseoKg.toFixed(1)}`,     `${r.porcentajeOseo?.toFixed(1)}%`],
          ['Residual', `${r.pesoResidualKg.toFixed(1)}`,  `${r.porcentajeResidual?.toFixed(1)}%`],
          ['TOTAL',    `${total.toFixed(1)}`,              '100%'],
        ],
        ...this.estilos(),
        headStyles: { fillColor: COLOR_VERDE_4C, textColor: COLOR_BLANCO, fontStyle: 'bold', fontSize: 9 },
        didParseCell: (hook: any) => {
          if (hook.section === 'body' && hook.row.index === 4) {
            hook.cell.styles.fontStyle = 'bold';
          }
        },
      });

      // Barra visual de composición
      let barY = finalY(doc) + 8;
      const barW = 160;
      const barH = 8;
      const segmentos: { label: string; pct: number; color: [number, number, number] }[] = [
        { label: 'Grasa',    pct: r.porcentajeGrasa4C  ?? 0, color: [231, 76,  60]  },
        { label: 'Muscular', pct: r.porcentajeMuscular ?? 0, color: [46,  204, 113] },
        { label: 'Óseo',     pct: r.porcentajeOseo     ?? 0, color: [52,  152, 219] },
        { label: 'Residual', pct: r.porcentajeResidual ?? 0, color: [155, 89,  182] },
      ];
      for (const seg of segmentos) {
        const w = Math.round(seg.pct / 100 * barW * 10) / 10;
        doc.setFillColor(...seg.color);
        doc.roundedRect(MARGEN, barY, w, barH, 1, 1, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLOR_TEXTO);
        doc.text(`${seg.label}  ${seg.pct.toFixed(1)}%`, MARGEN + w + 3, barY + 5.5);
        barY += barH + 5;
      }
      cursorFinal = barY;
    }

    // ── Sección 8: Pesos de Referencia ────────────────────────────────────────
    if (r.pesoIdealDikovics !== undefined || r.pesoIdealLorents !== undefined || r.pesoIdealMin !== undefined) {
      const COLOR_AZUL_REF: [number, number, number] = [26, 74, 138];
      const y8 = cursorFinal + 10;
      this.tituloColor(doc, '8. Pesos de Referencia', y8, COLOR_AZUL_REF);
      const bodyRef: string[][] = [];
      const diff = (ideal: number) => {
        const d = inp.peso - ideal;
        return `${d > 0 ? '+' : ''}${d.toFixed(1)} kg`;
      };
      if (r.pesoIdealDikovics !== undefined)
        bodyRef.push(['Dikovics (1966)',    `${r.pesoIdealDikovics.toFixed(1)} kg`, diff(r.pesoIdealDikovics)]);
      if (r.pesoIdealLorents !== undefined)
        bodyRef.push(['Lorents (1929)',     `${r.pesoIdealLorents.toFixed(1)} kg`,  diff(r.pesoIdealLorents)]);
      if (r.pesoIdealMin !== undefined && r.pesoIdealMax !== undefined)
        bodyRef.push(['Hamwi (rango)',      `${r.pesoIdealMin.toFixed(1)} – ${r.pesoIdealMax.toFixed(1)} kg`, inp.peso >= r.pesoIdealMin && inp.peso <= r.pesoIdealMax ? 'En rango' : diff((r.pesoIdealMin + r.pesoIdealMax) / 2)]);
      if (r.pesoAModificar !== undefined) {
        const pesoIdealComp = inp.peso - r.pesoAModificar;
        bodyRef.push(['Por composición',   `${pesoIdealComp.toFixed(1)} kg`, `${r.pesoAModificar > 0 ? '+' : ''}${r.pesoAModificar.toFixed(1)} kg`]);
      }
      autoTable(doc, {
        startY: y8 + 8, margin: { left: MARGEN, right: MARGEN },
        head: [['Método', 'Peso ideal', 'Diferencia']],
        body: bodyRef,
        ...this.estilos(),
        headStyles: { fillColor: COLOR_AZUL_REF, textColor: COLOR_BLANCO, fontStyle: 'bold', fontSize: 9 },
      });
      cursorFinal = finalY(doc);
    }

    // ── Sección 9: Excesos y Objetivos ────────────────────────────────────────
    if (r.grasaIdealPorcentaje !== undefined || r.excesoGrasaKg !== undefined || r.tmb24hrs !== undefined) {
      const COLOR_ROJO_EXC: [number, number, number] = [192, 57, 43];
      const y9 = cursorFinal + 10;
      this.tituloColor(doc, '9. Excesos y Objetivos', y9, COLOR_ROJO_EXC);
      const bodyExc: string[][] = [];
      if (r.grasaIdealPorcentaje !== undefined)
        bodyExc.push(['% Grasa ideal (Lohman)',     `${r.grasaIdealPorcentaje}%`]);
      if (r.excesoGrasaKg !== undefined)
        bodyExc.push(['Exceso de grasa',             `${r.excesoGrasaKg.toFixed(1)} kg`]);
      if (r.excesoCalorico !== undefined && r.excesoCalorico > 0)
        bodyExc.push(['Exceso calórico total',        `${r.excesoCalorico.toLocaleString('es-ES')} kcal`]);
      if (r.pesoAModificar !== undefined)
        bodyExc.push(['Peso a modificar',             `${r.pesoAModificar > 0 ? '+' : ''}${r.pesoAModificar.toFixed(1)} kg`]);
      if (r.masaCorporalActiva !== undefined)
        bodyExc.push(['Masa Corporal Activa',         `${r.masaCorporalActiva.toFixed(1)} kg`]);
      if (r.indiceAKS !== undefined)
        bodyExc.push(['Índice AKS (Kerr & Ross)',     `${r.indiceAKS.toFixed(3)}  (${r.clasificacionAKS ?? ''})`]);
      if (r.tmb24hrs !== undefined)
        bodyExc.push(['TMB 24 hrs (Mifflin-St Jeor)', `${r.tmb24hrs.toLocaleString('es-ES')} kcal/día`]);
      autoTable(doc, {
        startY: y9 + 8, margin: { left: MARGEN, right: MARGEN },
        head: [['Indicador', 'Valor']],
        body: bodyExc,
        ...this.estilos(),
        headStyles: { fillColor: COLOR_ROJO_EXC, textColor: COLOR_BLANCO, fontStyle: 'bold', fontSize: 9 },
      });
    }

    this.dibujarPiePaginas(doc, fecha);
    const nombre = inp.nombre
      ? `evaluacion-${inp.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${new Date().toISOString().slice(0, 10)}.pdf`
      : `evaluacion-fisica-${new Date().toISOString().slice(0, 10)}.pdf`;
    await this.guardarODescargar(doc, nombre);
  }

  private nombreArchivo(data: ClientData): string {
    const hoy    = new Date().toISOString().slice(0, 10);
    const nombre = data.nombre
      ? data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'cliente';
    return `reporte-${nombre}-${hoy}.pdf`;
  }
}
