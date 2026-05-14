import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ClientData, FitnessResults } from '../../shared/models/client.model';

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
    const ancho = doc.internal.pageSize.getWidth();
    doc.setFillColor(...COLOR_VERDE);
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

  private nombreArchivo(data: ClientData): string {
    const hoy    = new Date().toISOString().slice(0, 10);
    const nombre = data.nombre
      ? data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'cliente';
    return `reporte-${nombre}-${hoy}.pdf`;
  }
}
