import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardContent, IonIcon, IonBadge,
  IonFab, IonFabButton, IonButton, IonButtons, IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, addOutline, bodyOutline, barChartOutline, expandOutline,
  flashOutline, fitnessOutline, documentOutline, checkmarkCircleOutline,
  warningOutline, trophyOutline,
} from 'ionicons/icons';
import { PhysicalEvaluationInput, PhysicalEvaluationResults } from '../../shared/models/physical-evaluation.model';
import { PdfExportService } from '../../core/services/pdf-export.service';

@Component({
  selector: 'app-physical-evaluation-results',
  templateUrl: 'physical-evaluation-results.page.html',
  styleUrls: ['physical-evaluation-results.page.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardContent, IonIcon, IonBadge,
    IonFab, IonFabButton, IonButton, IonButtons, IonToast,
  ],
})
export class PhysicalEvaluationResultsPage implements OnInit {
  results    = signal<PhysicalEvaluationResults | null>(null);
  evalInput  = signal<PhysicalEvaluationInput | null>(null);
  exportando = signal(false);
  toastOpen  = signal(false);
  toastMsg   = signal('');
  toastColor = signal<'success' | 'danger'>('success');

  imc = computed(() => {
    const inp = this.evalInput();
    if (!inp?.peso || !inp?.estatura) return null;
    return inp.peso / (inp.estatura * inp.estatura);
  });

  porcentajeGrasa = computed(() => {
    const r = this.results();
    return r?.porcentajeGrasaPliegues ?? r?.porcentajeGrasaPerimetros ?? null;
  });

  constructor(
    private router: Router,
    private pdfExport: PdfExportService,
  ) {
    addIcons({
      arrowBackOutline, addOutline, bodyOutline, barChartOutline, expandOutline,
      flashOutline, fitnessOutline, documentOutline, checkmarkCircleOutline,
      warningOutline, trophyOutline,
    });
  }

  ngOnInit() {
    const nav   = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as {
      results: PhysicalEvaluationResults;
      input: PhysicalEvaluationInput;
    } | undefined;
    if (state?.results) {
      this.results.set(state.results);
      this.evalInput.set(state.input ?? null);
    } else {
      this.router.navigate(['/physical-evaluation']);
    }
  }

  get r(): PhysicalEvaluationResults { return this.results()!; }
  get inp(): PhysicalEvaluationInput  { return this.evalInput()!; }

  imcClasif(): string {
    const v = this.imc();
    if (v === null) return '';
    if (v < 18.5) return 'Bajo peso';
    if (v < 25)   return 'Normal';
    if (v < 30)   return 'Sobrepeso';
    return 'Obesidad';
  }

  imcColor(): string {
    const v = this.imc();
    if (v === null) return 'medium';
    if (v < 18.5) return 'warning';
    if (v < 25)   return 'success';
    if (v < 30)   return 'warning';
    return 'danger';
  }

  grasaColor(): string {
    const pct = this.porcentajeGrasa();
    if (pct === null) return 'medium';
    const m = this.evalInput()?.genero === 'Masculino';
    if (m) return pct < 10 ? 'warning' : pct < 20 ? 'success' : pct < 25 ? 'warning' : 'danger';
    return pct < 18 ? 'warning' : pct < 28 ? 'success' : pct < 33 ? 'warning' : 'danger';
  }

  iccColor(): string {
    const cls = this.r.clasificacionICCadera?.toLowerCase() ?? '';
    if (cls.includes('alto') || cls.includes('muy')) return 'danger';
    if (cls.includes('moderado')) return 'warning';
    return 'success';
  }

  iceColor(): string {
    const v = this.r.indiceCinturaEstatura ?? 0;
    if (v < 0.50) return 'success';
    if (v < 0.60) return 'warning';
    return 'danger';
  }

  ruffierColor(): string {
    const cls = this.r.clasificacionRuffier ?? '';
    if (cls === 'Excelente' || cls === 'Muy bueno') return 'success';
    if (cls === 'Bueno' || cls === 'Normal') return 'warning';
    return 'danger';
  }

  vo2Color(): string {
    const cls = this.r.clasificacionVo2 ?? '';
    if (cls === 'Excelente') return 'success';
    if (cls === 'Bueno') return 'primary';
    if (cls === 'Promedio') return 'warning';
    return 'danger';
  }

  pesoDiferencia(): string {
    const inp = this.evalInput();
    const r   = this.results();
    if (!inp?.peso || !r?.pesoIdealMin || !r?.pesoIdealMax) return '—';
    const peso = inp.peso;
    if (peso < r.pesoIdealMin) return `-${(r.pesoIdealMin - peso).toFixed(1)} kg bajo el mínimo`;
    if (peso > r.pesoIdealMax) return `+${(peso - r.pesoIdealMax).toFixed(1)} kg sobre el máximo`;
    return 'Dentro del rango ideal';
  }

  pesoDiferenciaColor(): string {
    const inp = this.evalInput();
    const r   = this.results();
    if (!inp?.peso || !r?.pesoIdealMin || !r?.pesoIdealMax) return 'medium';
    const peso = inp.peso;
    if (peso >= r.pesoIdealMin && peso <= r.pesoIdealMax) return 'success';
    if (Math.abs(peso - (r.pesoIdealMin + r.pesoIdealMax) / 2) < 5) return 'warning';
    return 'danger';
  }

  somatotipoSVG(): { x: number; y: number } {
    const e  = this.r.endomorfia  ?? 0;
    const m  = this.r.mesomorfia  ?? 0;
    const ec = this.r.ectomorfia  ?? 0;
    const sum = e + m + ec || 1;
    const x = Math.round(50 + (ec - e) / sum * 40);
    const y = Math.round(80 - m / sum * 60);
    return { x, y };
  }

  async exportarPDF() {
    this.exportando.set(true);
    try {
      await this.pdfExport.generarReporteEvaluacionFisica(this.inp, this.r);
      this.mostrarToast('PDF generado correctamente', 'success');
    } catch (e) {
      console.error(e);
      this.mostrarToast('Error al generar el PDF.', 'danger');
    } finally {
      this.exportando.set(false);
    }
  }

  private mostrarToast(msg: string, color: 'success' | 'danger') {
    this.toastMsg.set(msg);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }

  irInicio() { this.router.navigate(['/home']); }
  nueva()    { this.router.navigate(['/physical-evaluation']); }
}
