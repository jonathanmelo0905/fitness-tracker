import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  alertCircleOutline, arrowForwardOutline, fitnessOutline, personOutline,
  sunnyOutline, moonOutline, shieldCheckmarkOutline,
  checkmarkCircleOutline, checkmarkOutline, logoGoogle, logoApple,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

type Role = 'entrenador' | 'cliente';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, ReactiveFormsModule],
})
export class LoginPage {
  readonly activeRole   = signal<Role>('entrenador');
  readonly showPw       = signal(false);
  readonly submitting   = signal(false);
  readonly loginSuccess = signal(false);
  readonly rememberMe   = signal(true);
  readonly serverError  = signal<string | null>(null);
  readonly isDark       = computed(() => this.theme.currentTheme() === 'dark');

  form: FormGroup;

  get emailCtrl() { return this.form.get('email')!; }
  get pwCtrl()    { return this.form.get('password')!; }

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private theme: ThemeService,
  ) {
    addIcons({
      mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
      alertCircleOutline, arrowForwardOutline, fitnessOutline, personOutline,
      sunnyOutline, moonOutline, shieldCheckmarkOutline,
      checkmarkCircleOutline, checkmarkOutline, logoGoogle, logoApple,
    });
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  setRole(role: Role): void {
    this.activeRole.set(role);
    this.serverError.set(null);
    this.loginSuccess.set(false);
  }

  setTheme(dark: boolean): void {
    this.theme.setTheme(dark);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting() || this.loginSuccess()) return;

    this.submitting.set(true);
    this.serverError.set(null);

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.loginSuccess.set(true);
        setTimeout(() => {
          const dest = this.auth.userRole() === 'cliente' ? '/portal' : '/clientes';
          this.router.navigateByUrl(dest);
        }, 1800);
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(
          err?.error?.message ?? 'Credenciales incorrectas. Inténtalo de nuevo.'
        );
      },
    });
  }
}
