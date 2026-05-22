import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline, checkmarkCircleOutline,
  chevronBackOutline, chevronForwardOutline,
  closeOutline, leafOutline, sunnyOutline, moonOutline,
  personOutline, mailOutline, callOutline,
  barbellOutline, flameOutline, syncOutline, trophyOutline,
  heartOutline, lockClosedOutline, informationCircleOutline,
  keyOutline, eyeOutline, eyeOffOutline, refreshOutline,
  pulseOutline, waterOutline, footstepsOutline,
  addOutline, alertCircleOutline, copyOutline, warningOutline,
  medkitOutline,
} from 'ionicons/icons';
import { ClienteService } from '../../core/services/cliente.service';
import { ThemeService } from '../../core/services/theme.service';
import { ClienteCreate, SaludInfo, HabitosInfo } from '../../shared/models/cliente.model';

type StepStatus = 'pending' | 'done' | 'skipped';
interface StepDef { id: number; titulo: string; desc: string; required: boolean; }
interface GoalOpt { v: string; icon: string; sub: string; }
interface SegOpt  { v: string; label: string; sub?: string; }

const GOALS: GoalOpt[] = [
  { v: 'Bajar grasa',   icon: 'flame-outline',   sub: 'Déficit calórico controlado' },
  { v: 'Ganar músculo', icon: 'barbell-outline',  sub: 'Superávit + entrenamiento de fuerza' },
  { v: 'Recomposición', icon: 'sync-outline',     sub: 'Ganar masa magra y bajar grasa' },
  { v: 'Rendimiento',   icon: 'trophy-outline',   sub: 'Optimizar fuerza, resistencia, potencia' },
];

const NIVELES: SegOpt[] = [
  { v: 'Principiante', label: 'Principiante', sub: '< 6 meses' },
  { v: 'Intermedio',   label: 'Intermedio',   sub: '6 m – 2 años' },
  { v: 'Avanzado',     label: 'Avanzado',     sub: '+ 2 años' },
];

const SEXOS: SegOpt[] = [
  { v: 'Femenino',  label: 'Femenino' },
  { v: 'Masculino', label: 'Masculino' },
  { v: 'Otro',      label: 'Otro' },
];

const PW_LABELS = ['', 'Muy débil', 'Débil', 'Aceptable', 'Excelente'];

function generatePassword(): string {
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digit = '23456789';
  const sym   = '!@#$%&*?';
  const all   = lower + upper + digit + sym;
  let pw = upper[Math.floor(Math.random() * upper.length)]
         + lower[Math.floor(Math.random() * lower.length)]
         + digit[Math.floor(Math.random() * digit.length)]
         + sym  [Math.floor(Math.random() * sym.length)];
  for (let i = 0; i < 8; i++) pw += all[Math.floor(Math.random() * all.length)];
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

@Component({
  selector: 'app-cliente-registro',
  templateUrl: 'cliente-registro.page.html',
  styleUrls: ['cliente-registro.page.scss'],
  standalone: true,
  imports: [DecimalPipe, RouterLink, IonContent, IonIcon, IonSpinner, ReactiveFormsModule],
})
export class ClienteRegistroPage {
  // ── State ─────────────────────────────────────────────────────────────────
  readonly paso        = signal(1);
  readonly submitting  = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly statuses    = signal<Record<number, StepStatus>>({ 1:'pending', 2:'pending', 3:'pending', 4:'pending', 5:'pending' });
  readonly mostrarModal  = signal(false);
  readonly passwordModal = signal('');
  readonly emailModal    = signal('');
  readonly nombreModal   = signal('');
  readonly copiado       = signal(false);
  readonly verPassword   = signal(false);
  private  clienteIdCreado = '';

  // ── Step definitions ──────────────────────────────────────────────────────
  readonly steps: StepDef[] = [
    { id: 1, titulo: 'Datos básicos',      desc: 'Identidad del cliente.',              required: true  },
    { id: 2, titulo: 'Medidas iniciales',  desc: 'Peso, estatura, objetivo y nivel.',   required: false },
    { id: 3, titulo: 'Historial de salud', desc: 'Lesiones, condiciones, medicación.',  required: false },
    { id: 4, titulo: 'Hábitos diarios',    desc: 'Sueño, estrés, hidratación, pasos.', required: false },
    { id: 5, titulo: 'Acceso al portal',   desc: 'Contraseña temporal (opcional).',     required: false },
  ];

  readonly goalOpts  = GOALS;
  readonly nivelOpts = NIVELES;
  readonly sexoOpts  = SEXOS;

  // ── Forms ─────────────────────────────────────────────────────────────────
  f1!: FormGroup;
  f2!: FormGroup;
  f3!: FormGroup;
  f4!: FormGroup;
  f5!: FormGroup;

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly progressPct    = computed(() => ((this.paso() - 1) / (this.steps.length - 1)) * 100);
  readonly currentStep    = computed(() => this.steps.find(s => s.id === this.paso())!);
  readonly nombreCompleto = computed(() => {
    if (!this.f1) return '';
    const v = this.f1.value;
    return [v.firstName, v.lastName].filter(Boolean).join(' ');
  });
  readonly canAdvance = computed(() => this.paso() !== 1 || (!!this.f1 && this.f1.valid));

  // ── Theme ─────────────────────────────────────────────────────────────────
  get isDark(): boolean { return this.themeService.isDarkTheme(); }
  setTheme(dark: boolean): void { this.themeService.setTheme(dark); }

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private themeService: ThemeService,
    private router: Router,
  ) {
    addIcons({
      checkmarkOutline, checkmarkCircleOutline,
      chevronBackOutline, chevronForwardOutline,
      closeOutline, leafOutline, sunnyOutline, moonOutline,
      personOutline, mailOutline, callOutline,
      barbellOutline, flameOutline, syncOutline, trophyOutline,
      heartOutline, lockClosedOutline, informationCircleOutline,
      keyOutline, eyeOutline, eyeOffOutline, refreshOutline,
      pulseOutline, waterOutline, footstepsOutline,
      addOutline, alertCircleOutline, copyOutline, warningOutline,
      medkitOutline,
    });
    this.buildForms();
  }

  private buildForms(): void {
    this.f1 = this.fb.group({
      firstName:       ['', [Validators.required, Validators.minLength(2)]],
      lastName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      telefono:        [''],
      fechaNacimiento: ['', Validators.required],
      sexo:            ['', Validators.required],
    });
    this.f2 = this.fb.group({
      pesoInicial: [null],
      estatura:    [null],
      objetivo:    [''],
      nivel:       [''],
    });
    this.f3 = this.fb.group({
      enfermedades:  [''],
      medicamentos:  [''],
      lesiones:      [''],
      cirugias:      [''],
      restricciones: [''],
    });
    this.f4 = this.fb.group({
      sueno:         [7.5],
      estres:        [4],
      agua:          [2.5],
      pasos_diarios: [7000],
    });
    this.f5 = this.fb.group({
      passwordTemporal: [''],
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  siguiente(): void {
    if (this.paso() === 1) {
      this.f1.markAllAsTouched();
      if (this.f1.invalid) return;
    }
    this.markCurrent(this.hasStepData(this.paso()) ? 'done' : 'skipped');
    if (this.paso() < this.steps.length) this.paso.update(p => p + 1);
    this.serverError.set(null);
  }

  saltar(): void {
    this.markCurrent('skipped');
    if (this.paso() < this.steps.length) this.paso.update(p => p + 1);
  }

  anterior(): void {
    if (this.paso() > 1) this.paso.update(p => p - 1);
    this.serverError.set(null);
  }

  jumpTo(id: number): void {
    if (id <= this.paso()) { this.paso.set(id); return; }
    if (this.f1.valid) {
      this.markCurrent(this.hasStepData(this.paso()) ? 'done' : 'skipped');
      this.paso.set(id);
    } else {
      this.f1.markAllAsTouched();
    }
  }

  cancelar(): void {
    if (confirm('¿Cancelar el registro? Se perderá la información ingresada.')) {
      this.router.navigateByUrl('/clientes');
    }
  }

  private markCurrent(s: StepStatus): void {
    this.statuses.update(st => ({ ...st, [this.paso()]: s }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStatus(id: number): StepStatus { return this.statuses()[id]; }

  private hasStepData(id: number): boolean {
    switch (id) {
      case 1: return this.f1.valid;
      case 2: { const v = this.f2.value; return !!(v.pesoInicial || v.estatura || v.objetivo || v.nivel); }
      case 3: { const v = this.f3.value; return !!(v.enfermedades || v.medicamentos || v.lesiones || v.cirugias || v.restricciones); }
      case 4: return true;
      case 5: return !!(this.f5.value.passwordTemporal?.trim());
      default: return false;
    }
  }

  isInvalid1(name: string): boolean {
    const c = this.f1.get(name)!;
    return c.invalid && c.touched;
  }

  setF1(field: string, value: string): void {
    this.f1.get(field)!.setValue(value);
    this.f1.get(field)!.markAsTouched();
  }

  // ── Password ──────────────────────────────────────────────────────────────
  generarPassword(): void {
    this.f5.get('passwordTemporal')!.setValue(generatePassword());
  }

  toggleVerPassword(): void { this.verPassword.update(v => !v); }

  get pwScore(): number {
    const pw: string = this.f5.value.passwordTemporal ?? '';
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
  }

  get pwScoreLabel(): string { return PW_LABELS[this.pwScore]; }

  get pwChecks(): { hasLen: boolean; hasMix: boolean; hasNum: boolean; hasSym: boolean } {
    const pw: string = this.f5.value.passwordTemporal ?? '';
    return {
      hasLen: pw.length >= 8,
      hasMix: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
      hasNum: /\d/.test(pw),
      hasSym: /[^A-Za-z0-9]/.test(pw),
    };
  }

  pwBarClass(bar: number): string {
    return this.pwScore >= bar ? `fill-${this.pwScore}` : '';
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  crear(): void {
    this.f1.markAllAsTouched();
    if (this.f1.invalid) { this.paso.set(1); return; }
    this.submitting.set(true);
    this.serverError.set(null);

    const v1 = this.f1.value;
    const v2 = this.f2.value;
    const v3 = this.f3.value;
    const v4 = this.f4.value;
    const pwd = (this.f5.value.passwordTemporal as string)?.trim();

    const salud: SaludInfo = {};
    if (v3.enfermedades?.trim())  salud.enfermedades  = v3.enfermedades.trim();
    if (v3.medicamentos?.trim())  salud.medicamentos  = v3.medicamentos.trim();
    if (v3.lesiones?.trim())      salud.lesiones      = v3.lesiones.trim();
    if (v3.cirugias?.trim())      salud.cirugias      = v3.cirugias.trim();
    if (v3.restricciones?.trim()) salud.restricciones = v3.restricciones.trim();

    const habitos: HabitosInfo = { sueno: v4.sueno, estres: v4.estres, agua: v4.agua, pasos_diarios: v4.pasos_diarios };

    const data: ClienteCreate = {
      nombre:          `${v1.firstName.trim()} ${v1.lastName.trim()}`.trim(),
      email:           v1.email.trim(),
      fechaNacimiento: v1.fechaNacimiento,
      sexo:            v1.sexo,
      ...(v1.telefono?.trim()  && { telefono:    v1.telefono.trim() }),
      ...(v2.pesoInicial       && { pesoInicial: +v2.pesoInicial }),
      ...(v2.estatura          && { estatura:    +v2.estatura }),
      ...(v2.objetivo          && { objetivo:    v2.objetivo }),
      ...(v2.nivel             && { nivel:       v2.nivel }),
      ...(Object.keys(salud).length && { salud }),
      habitos,
      ...(pwd && { passwordTemporal: pwd }),
    };

    this.clienteService.create(data).subscribe({
      next: (cliente) => {
        this.submitting.set(false);
        this.clienteIdCreado = cliente.id;
        this.emailModal.set(v1.email.trim());
        this.nombreModal.set(data.nombre);
        if (pwd) this.passwordModal.set(pwd);
        this.mostrarModal.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(err?.error?.message ?? 'Error al crear el cliente. Intenta de nuevo.');
      },
    });
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  async copiarPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.passwordModal());
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    } catch { /* clipboard unavailable */ }
  }

  cerrarModal(): void {
    this.passwordModal.set('');
    this.mostrarModal.set(false);
    this.router.navigate(['/clientes', this.clienteIdCreado]);
  }
}
