import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonToast, IonText,
  IonAccordion, IonAccordionGroup, IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, checkmarkCircleOutline, checkmarkOutline, chevronForwardOutline, chevronBackOutline, bodyOutline,
  barChartOutline, expandOutline, fitnessOutline, flashOutline,
  warningOutline, informationCircleOutline,
} from 'ionicons/icons';
import { PhysicalEvaluationService } from '../../core/services/physical-evaluation.service';
import { PhysicalEvaluationInput, SkinfoldData, GirthData } from '../../shared/models/physical-evaluation.model';

@Component({
  selector: 'app-physical-evaluation',
  templateUrl: 'physical-evaluation.page.html',
  styleUrls: ['physical-evaluation.page.scss'],
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonToast, IonText,
    IonAccordion, IonAccordionGroup, IonButtons,
  ],
})
export class PhysicalEvaluationPage {
  paso         = signal<string>('1');
  maxPaso      = signal<string>('1');
  showToast    = signal(false);
  toastMessage = signal('');

  form = signal<PhysicalEvaluationInput>({
    nombre: '',
    edad: 0,
    peso: 0,
    estatura: 0,
    genero: 'Masculino',
    skinfolds:    { formula: 'jackson3' },
    girths:       {},
    boneDiameters:{},
    fitnessTests: {},
  });

  // ── Live computed previews ──────────────────────────────────────────────────
  imcPreview = computed(() => {
    const f = this.form();
    if (!f.peso || !f.estatura) return null;
    return f.peso / (f.estatura * f.estatura);
  });

  sumaPlieguesPreview = computed(() => {
    const s = this.form().skinfolds;
    if (!s) return null;
    const vals: (number | undefined)[] = [];
    if (s.formula === 'jackson3') {
      if (this.form().genero === 'Masculino') vals.push(s.pectoral, s.abdominal, s.musloAnterior);
      else vals.push(s.triceps, s.suprailiaco, s.musloAnterior);
    } else if (s.formula === 'jackson7') {
      vals.push(s.pectoral, s.axilarMedio, s.triceps, s.subescapular, s.abdominal, s.suprailiaco, s.musloAnterior);
    } else {
      vals.push(s.biceps, s.triceps, s.subescapular, s.suprailiaco);
    }
    if (vals.some(v => !v)) return null;
    return vals.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) as number;
  });

  iccPreview = computed(() => {
    const g = this.form().girths;
    if (!g?.cintura || !g?.cadera) return null;
    return g.cintura / g.cadera;
  });

  icePreview = computed(() => {
    const g = this.form().girths;
    const f = this.form();
    if (!g?.cintura || !f.estatura) return null;
    return g.cintura / (f.estatura * 100);
  });

  esMasculino = computed(() => this.form().genero === 'Masculino');
  formulaActual = computed(() => this.form().skinfolds?.formula ?? 'jackson3');

  constructor(private service: PhysicalEvaluationService, private router: Router) {
    addIcons({
      arrowBackOutline, checkmarkCircleOutline, checkmarkOutline, chevronForwardOutline, chevronBackOutline, bodyOutline,
      barChartOutline, expandOutline, fitnessOutline, flashOutline,
      warningOutline, informationCircleOutline,
    });
  }

  onPasoChange(event: CustomEvent) {
    this.paso.set(event.detail.value);
  }

  siguientePaso() {
    const n = +this.paso();
    if (n === 1) {
      const f = this.form();
      if (!f.edad || !f.peso || !f.estatura) {
        this.toastMessage.set('Completa edad, peso y estatura para continuar.');
        this.showToast.set(true);
        return;
      }
    } else if (n === 2) {
      const s = this.form().skinfolds;
      const formula = s?.formula ?? 'jackson3';
      let valid = false;
      if (formula === 'jackson3') {
        valid = this.form().genero === 'Masculino'
          ? !!(s?.pectoral && s?.abdominal && s?.musloAnterior)
          : !!(s?.triceps && s?.suprailiaco && s?.musloAnterior);
      } else if (formula === 'jackson7') {
        valid = !!(s?.pectoral && s?.axilarMedio && s?.triceps && s?.subescapular && s?.abdominal && s?.suprailiaco && s?.musloAnterior);
      } else {
        valid = !!(s?.biceps && s?.triceps && s?.subescapular && s?.suprailiaco);
      }
      if (!valid) {
        this.toastMessage.set('Completa todos los pliegues requeridos para continuar.');
        this.showToast.set(true);
        return;
      }
    }
    const next = String(n + 1);
    this.paso.set(next);
    if (next > this.maxPaso()) this.maxPaso.set(next);
  }

  navigateTo(n: string) {
    if (n <= this.maxPaso()) this.paso.set(n);
  }

  update(partial: Partial<PhysicalEvaluationInput>) {
    this.form.update(f => ({ ...f, ...partial }));
  }

  updateSkinfolds(partial: Partial<SkinfoldData>) {
    this.form.update(f => ({ ...f, skinfolds: { ...(f.skinfolds ?? { formula: 'jackson3' }), ...partial } as SkinfoldData }));
  }

  updateGirths(partial: Partial<GirthData>) {
    this.form.update(f => ({ ...f, girths: { ...(f.girths ?? {}), ...partial } }));
  }

  updateDiameters(partial: Record<string, number | undefined>) {
    this.form.update(f => ({ ...f, boneDiameters: { ...(f.boneDiameters ?? {}), ...partial } }));
  }

  updateTests(partial: Record<string, number | string | undefined>) {
    this.form.update(f => ({ ...f, fitnessTests: { ...(f.fitnessTests ?? {}), ...partial } }));
  }

  numVal(event: Event): number | undefined {
    const v = +(event as any).target.value;
    return (isNaN(v) || v <= 0) ? undefined : v;
  }

  strVal(event: Event): string {
    return (event as any).target.value ?? '';
  }

  calcular() {
    const f = this.form();
    if (!f.edad || !f.peso || !f.estatura) {
      this.toastMessage.set('Completa al menos edad, peso y estatura.');
      this.showToast.set(true);
      return;
    }
    const results = this.service.calcular(f);
    this.router.navigate(['/physical-evaluation-results'], { state: { results, input: f } });
  }

  irInicio() { this.router.navigate(['/home']); }
}
