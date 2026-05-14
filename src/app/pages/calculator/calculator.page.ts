import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonRange, IonButton, IonIcon,
  IonToast, IonText, IonGrid, IonRow, IonCol, IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calculatorOutline, chevronForwardOutline, chevronBackOutline,
  checkmarkCircleOutline, addOutline, removeOutline, arrowBackOutline,
} from 'ionicons/icons';
import { FitnessCalculatorService } from '../../core/services/fitness-calculator.service';
import { ClientData } from '../../shared/models/client.model';

@Component({
  selector: 'app-calculator',
  templateUrl: 'calculator.page.html',
  styleUrls: ['calculator.page.scss'],
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonRange, IonButton, IonIcon,
    IonToast, IonText, IonGrid, IonRow, IonCol, IonButtons,
  ],
})
export class CalculatorPage implements OnInit {
  paso         = signal<'1' | '2'>('1');
  showToast    = signal(false);
  toastMessage = signal('');

  form = signal<ClientData>({
    nombre: '',
    edad: 0,
    peso: 0,
    estatura: 0,
    genero: 'Masculino',
    grasaEstimada: 0,
    grasaObjetivo: 0,
    multiplicadorActividad: 1.55,
    ajusteCalorico: -0.25,
    distribucionCarbs: 0.40,
    distribucionProteinas: 0.30,
    distribucionGrasas: 0.30,
  });

  // Computed para la UI
  grasaEstimadaPct         = computed(() => Math.round(this.form().grasaEstimada * 100));
  grasaObjetivoPct         = computed(() => Math.round(this.form().grasaObjetivo * 100));
  distribucionCarbsPct     = computed(() => Math.round(this.form().distribucionCarbs * 100));
  distribucionProteinasPct = computed(() => Math.round(this.form().distribucionProteinas * 100));
  distribucionGrasasPct    = computed(() => Math.round(this.form().distribucionGrasas * 100));
  macroSuma                = computed(() => this.distribucionCarbsPct() + this.distribucionProteinasPct() + this.distribucionGrasasPct());

  ajusteCaloricoLabel = computed(() => {
    const v = Math.round(this.form().ajusteCalorico * 100);
    return v > 0 ? `+${v}%` : `${v}%`;
  });

  // ─── Preview en vivo: calorías objetivo ────────────────────────────────────
  caloriasObjetivoPrev = computed(() => {
    const f = this.form();
    if (!f.peso || !f.estatura || !f.edad) return null;
    const cm  = f.estatura * 100;
    const tmb = f.genero === 'Masculino'
      ? (10 * f.peso) + (6.25 * cm) - (5 * f.edad) + 5
      : (10 * f.peso) + (6.25 * cm) - (5 * f.edad) - 161;
    return Math.round(tmb * f.multiplicadorActividad * (1 + f.ajusteCalorico));
  });

  caloriasMantenimientoPrev = computed(() => {
    const f = this.form();
    if (!f.peso || !f.estatura || !f.edad) return null;
    const cm  = f.estatura * 100;
    const tmb = f.genero === 'Masculino'
      ? (10 * f.peso) + (6.25 * cm) - (5 * f.edad) + 5
      : (10 * f.peso) + (6.25 * cm) - (5 * f.edad) - 161;
    return Math.round(tmb * f.multiplicadorActividad);
  });

  // ─── Preview en vivo: macros en gramos y g/kg ──────────────────────────────
  macrosPrev = computed(() => {
    const f = this.form();
    if (!f.peso || !f.estatura || !f.edad) return null;
    const cm  = f.estatura * 100;
    const tmb = f.genero === 'Masculino'
      ? (10 * f.peso) + (6.25 * cm) - (5 * f.edad) + 5
      : (10 * f.peso) + (6.25 * cm) - (5 * f.edad) - 161;
    const cal  = tmb * f.multiplicadorActividad * (1 + f.ajusteCalorico);
    const prot = (cal * f.distribucionProteinas) / 4;
    const mlg  = f.peso * (1 - f.grasaEstimada);
    return {
      carbsG:   Math.round((cal * f.distribucionCarbs) / 4),
      protG:    Math.round(prot),
      grasasG:  Math.round((cal * f.distribucionGrasas) / 9),
      protGKg:  (prot / f.peso).toFixed(1),
      protGKgMLG: (prot / mlg).toFixed(1),
      carbsGKg: ((cal * f.distribucionCarbs / 4) / f.peso).toFixed(1),
      grasasGKg: ((cal * f.distribucionGrasas / 9) / f.peso).toFixed(1),
    };
  });

  nivelesActividad = [
    { label: 'Muy poco activo — Sedentario (x1.2)',           value: 1.2  },
    { label: 'Poco activo — Ejercicio ligero 1-3 días/sem (x1.3)', value: 1.3  },
    { label: 'Activo — Ejercicio moderado 3-5 días/sem (x1.4)',    value: 1.4  },
    { label: 'Moderado — Ejercicio 4-5 días/sem (x1.55)',          value: 1.55 },
    { label: 'Muy activo — Ejercicio intenso 6-7 días/sem (x1.7)', value: 1.7  },
    { label: 'Extremadamente activo — Atleta/trabajo físico (x1.9)', value: 1.9 },
  ];

  constructor(private calculator: FitnessCalculatorService, private router: Router) {
    addIcons({ calculatorOutline, chevronForwardOutline, chevronBackOutline, checkmarkCircleOutline, addOutline, removeOutline, arrowBackOutline });
  }

  ngOnInit() {
    // Carga defaults numéricos pero deja el nombre vacío para que sea obligatorio
    const defaults = this.calculator.getValoresDefault();
    this.form.set({ ...defaults, nombre: '' });
  }

  update(partial: Partial<ClientData>) {
    this.form.update(f => ({ ...f, ...partial }));
  }

  // ─── Handlers de rango (slider) ──────────────────────────────────────────
  onGrasaEstimadaChange(e: any)  { this.update({ grasaEstimada: e.detail.value / 100 }); }
  onGrasaObjetivoChange(e: any)  { this.update({ grasaObjetivo: e.detail.value / 100 }); }
  onAjusteCaloricoChange(e: any) { this.update({ ajusteCalorico: e.detail.value / 100 }); }

  onCarbsChange(e: any) {
    const carbs  = e.detail.value / 100;
    const grasas = Math.max(0, Math.round((1 - carbs - this.form().distribucionProteinas) * 100) / 100);
    this.update({ distribucionCarbs: carbs, distribucionGrasas: grasas });
  }

  onProteinasChange(e: any) {
    const prot   = e.detail.value / 100;
    const grasas = Math.max(0, Math.round((1 - this.form().distribucionCarbs - prot) * 100) / 100);
    this.update({ distribucionProteinas: prot, distribucionGrasas: grasas });
  }

  // ─── Ajuste con flechas +/- ───────────────────────────────────────────────
  adjustGrasaEstimada(delta: number) {
    const v = Math.min(50, Math.max(5, this.grasaEstimadaPct() + delta));
    this.update({ grasaEstimada: v / 100 });
  }

  adjustGrasaObjetivo(delta: number) {
    const v = Math.min(30, Math.max(5, this.grasaObjetivoPct() + delta));
    this.update({ grasaObjetivo: v / 100 });
  }

  adjustAjusteCalorico(delta: number) {
    const current = Math.round(this.form().ajusteCalorico * 100);
    const v = Math.min(40, Math.max(-40, current + delta));
    this.update({ ajusteCalorico: v / 100 });
  }

  adjustCarbs(delta: number) {
    const v      = Math.min(89, Math.max(1, this.distribucionCarbsPct() + delta));
    const grasas = Math.max(0, Math.round((1 - v / 100 - this.form().distribucionProteinas) * 100) / 100);
    this.update({ distribucionCarbs: v / 100, distribucionGrasas: grasas });
  }

  adjustProteinas(delta: number) {
    const v      = Math.min(89, Math.max(1, this.distribucionProteinasPct() + delta));
    const grasas = Math.max(0, Math.round((1 - this.form().distribucionCarbs - v / 100) * 100) / 100);
    this.update({ distribucionProteinas: v / 100, distribucionGrasas: grasas });
  }

  // ─── Navegación ───────────────────────────────────────────────────────────
  siguientePaso() {
    const f = this.form();
    if (!f.nombre?.trim()) {
      this.toastMessage.set('El nombre del cliente es obligatorio.');
      this.showToast.set(true);
      return;
    }
    if (!f.edad || !f.peso || !f.estatura) {
      this.toastMessage.set('Por favor completa todos los campos requeridos.');
      this.showToast.set(true);
      return;
    }
    if (!f.grasaEstimada || !f.grasaObjetivo) {
      this.toastMessage.set('Indica el % de grasa actual y el % de grasa objetivo.');
      this.showToast.set(true);
      return;
    }
    if (f.grasaObjetivo >= f.grasaEstimada) {
      this.toastMessage.set('El % grasa objetivo debe ser menor al % grasa estimado actual.');
      this.showToast.set(true);
      return;
    }
    this.paso.set('2');
  }

  calcular() {
    if (this.macroSuma() !== 100) {
      this.toastMessage.set(`Los macros deben sumar 100%. Actualmente: ${this.macroSuma()}%`);
      this.showToast.set(true);
      return;
    }
    const results = this.calculator.calcular(this.form());
    this.router.navigate(['/results'], { state: { results } });
  }

  irInicio() { this.router.navigate(['/home']); }
}
