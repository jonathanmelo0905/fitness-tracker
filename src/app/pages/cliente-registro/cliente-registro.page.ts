import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonGrid, IonRow, IonCol, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, checkmarkOutline,
  personOutline, barbellOutline, medkitOutline, documentTextOutline,
  informationCircleOutline, addOutline, alertCircleOutline,
  keyOutline, eyeOutline, eyeOffOutline, copyOutline,
  warningOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import { ClienteService } from '../../core/services/cliente.service';
import { ClienteCreate } from '../../shared/models/cliente.model';

@Component({
  selector: 'app-cliente-registro',
  templateUrl: 'cliente-registro.page.html',
  styleUrls: ['cliente-registro.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonGrid, IonRow, IonCol, IonIcon, IonSpinner,
    ReactiveFormsModule,
  ],
})
export class ClienteRegistroPage {
  readonly paso        = signal(0);
  readonly submitting  = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly mostrarModal  = signal(false);
  readonly passwordModal = signal('');
  readonly emailModal    = signal('');
  readonly copiado       = signal(false);
  readonly verPassword   = signal(false);
  private clienteIdCreado = 0;

  readonly pasos = [
    { titulo: 'Datos',       subtitulo: 'Datos personales',       icono: 'person-outline'        },
    { titulo: 'Medidas',     subtitulo: 'Condición física',        icono: 'barbell-outline'       },
    { titulo: 'Salud',       subtitulo: 'Historial de salud',      icono: 'medkit-outline'        },
    { titulo: 'PAR-Q',       subtitulo: 'PAR-Q y consentimiento',  icono: 'document-text-outline' },
  ];

  // Qué pasos del onboarding (1-7) cubre este formulario
  readonly onboardingCubre = [
    { num: 1, label: 'Datos básicos',         step: 0 },
    { num: 2, label: 'Medidas iniciales',      step: 1 },
    { num: 6, label: 'PAR-Q',                  step: 3 },
    { num: 7, label: 'Consentimiento',         step: 3 },
  ];
  readonly onboardingDespues = [
    { num: 3, label: 'Fotos iniciales'         },
    { num: 4, label: 'Evaluación física'       },
    { num: 5, label: 'Primera sesión agendada' },
  ];

  paso1: FormGroup;
  paso2: FormGroup;
  paso3: FormGroup;
  paso4: FormGroup;

  readonly formularioActual = computed((): FormGroup => {
    const forms = [this.paso1, this.paso2, this.paso3, this.paso4];
    return forms[this.paso()];
  });

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
  ) {
    addIcons({
      chevronBackOutline, chevronForwardOutline, checkmarkOutline,
      personOutline, barbellOutline, medkitOutline, documentTextOutline,
      informationCircleOutline, addOutline, alertCircleOutline,
      keyOutline, eyeOutline, eyeOffOutline, copyOutline,
      warningOutline, checkmarkCircleOutline,
    });

    this.paso1 = this.fb.group({
      nombre:           ['', [Validators.required, Validators.minLength(2)]],
      apellido:         ['', [Validators.required, Validators.minLength(2)]],
      email:            ['', [Validators.required, Validators.email]],
      telefono:         [''],
      fechaNacimiento:  ['', Validators.required],
      genero:           ['', Validators.required],
      passwordTemporal: [''],
    });

    this.paso2 = this.fb.group({
      pesoInicial:    [null],
      altura:         [null],
      nivelActividad: ['moderado', Validators.required],
      objetivos:      [''],
    });

    this.paso3 = this.fb.group({
      condicionesMedicas: [''],
      medicamentos:       [''],
      lesiones:           [''],
    });

    this.paso4 = this.fb.group({
      parqAprobado:          [false],
      consentimientoFirmado: [false],
    });
  }

  siguiente(): void {
    this.formularioActual().markAllAsTouched();
    if (this.formularioActual().invalid) return;
    this.paso.update(p => Math.min(p + 1, 3));
    this.serverError.set(null);
  }

  anterior(): void {
    this.paso.update(p => Math.max(p - 1, 0));
    this.serverError.set(null);
  }

  cancelar(): void {
    this.router.navigateByUrl('/clientes');
  }

  crear(): void {
    this.paso4.markAllAsTouched();
    if (this.paso1.invalid) { this.paso.set(0); return; }

    this.submitting.set(true);
    this.serverError.set(null);

    const v1 = this.paso1.value;
    const v2 = this.paso2.value;
    const v3 = this.paso3.value;
    const v4 = this.paso4.value;

    const pwd = (v1.passwordTemporal as string)?.trim();

    const data: ClienteCreate = {
      nombre:                v1.nombre.trim(),
      apellido:              v1.apellido.trim(),
      email:                 v1.email.trim(),
      ...(v1.telefono        && { telefono:          v1.telefono.trim() }),
      fechaNacimiento:       v1.fechaNacimiento,
      genero:                v1.genero,
      ...(v2.pesoInicial     && { pesoInicial:       +v2.pesoInicial }),
      ...(v2.altura          && { altura:            +v2.altura }),
      nivelActividad:        v2.nivelActividad,
      ...(v2.objetivos       && { objetivos:         v2.objetivos.trim() }),
      ...(v3.condicionesMedicas && { condicionesMedicas: v3.condicionesMedicas.trim() }),
      ...(v3.medicamentos    && { medicamentos:      v3.medicamentos.trim() }),
      ...(v3.lesiones        && { lesiones:          v3.lesiones.trim() }),
      parqAprobado:          v4.parqAprobado,
      consentimientoFirmado: v4.consentimientoFirmado,
      ...(pwd                && { passwordTemporal:  pwd }),
    };

    this.clienteService.create(data).subscribe({
      next: (cliente) => {
        this.submitting.set(false);
        if (pwd) {
          this.clienteIdCreado = cliente.id;
          this.emailModal.set(v1.email.trim());
          this.passwordModal.set(pwd);
          this.mostrarModal.set(true);
        } else {
          this.router.navigate(['/clientes', cliente.id]);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(err?.error?.message ?? 'Error al crear el cliente. Intenta de nuevo.');
      },
    });
  }

  async copiarPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.passwordModal());
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    } catch { /* clipboard no disponible */ }
  }

  cerrarModal(): void {
    this.passwordModal.set('');
    this.mostrarModal.set(false);
    this.router.navigate(['/clientes', this.clienteIdCreado]);
  }

  // Helpers para validación en template
  ctrl(form: FormGroup, name: string) { return form.get(name)!; }
  isInvalid(form: FormGroup, name: string): boolean {
    const c = this.ctrl(form, name);
    return c.invalid && c.touched;
  }
}
