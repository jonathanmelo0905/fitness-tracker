import { Component, computed, signal, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  leafOutline, peopleOutline, calendarOutline, constructOutline,
  settingsOutline, logOutOutline, addOutline, searchOutline,
  filterOutline, swapVerticalOutline, notificationsOutline,
  sunnyOutline, moonOutline, arrowUpOutline, arrowDownOutline,
  removeOutline, checkmarkCircleOutline, personAddOutline,
  alertCircleOutline, trendingUpOutline, timeOutline,
  calendarClearOutline, eyeOutline, chatbubbleOutline,
  ellipsisHorizontalOutline, chevronBackOutline, refreshOutline, closeOutline,
} from 'ionicons/icons';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService }    from '../../core/services/auth.service';
import { ThemeService }   from '../../core/services/theme.service';
import { Cliente, calcularOnboarding, OnboardingStatus } from '../../shared/models/cliente.model';

type ViewState = 'loading' | 'loaded' | 'empty' | 'error';
type Filter    = 'all' | 'active' | 'onboarding' | 'inactive';

interface Grupo { id: string; titulo: string; dot: string; items: Cliente[]; }

@Component({
  selector: 'app-clientes',
  templateUrl: 'clientes.page.html',
  styleUrls: ['clientes.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon],
})
export class ClientesPage implements OnInit {
  readonly viewState = signal<ViewState>('loading');
  readonly query     = signal('');
  readonly filter    = signal<Filter>('all');
  readonly collapsed   = signal(false);
  readonly drawerOpen  = signal(false);
  readonly todayLabel  = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  readonly clientes  = this.clienteService.clientes;
  readonly userName  = this.auth.userName;
  readonly theme     = this.themeService.currentTheme;

  readonly filterOpts: { value: Filter; label: string }[] = [
    { value: 'all',        label: 'Todos' },
    { value: 'active',     label: 'Activos' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'inactive',   label: 'Inactivos' },
  ];

  readonly stats = computed(() => {
    const list = this.clientes();
    const now = new Date();
    const mes = now.getFullYear() * 12 + now.getMonth();
    return {
      total:   list.length,
      activos: list.filter(c => c.activo && this.onboardingOf(c).completados === 7).length,
      nuevos:  list.filter(c => {
        const d = new Date(c.creadoEn);
        return d.getFullYear() * 12 + d.getMonth() === mes;
      }).length,
      atencion: list.filter(c => c.activo && this.onboardingOf(c).completados < 7).length,
    };
  });

  readonly counts = computed((): Record<string, number> => ({
    all:        this.clientes().length,
    active:     this.clientes().filter(c => c.activo && this.onboardingOf(c).completados === 7).length,
    onboarding: this.clientes().filter(c => c.activo && this.onboardingOf(c).completados < 7).length,
    inactive:   this.clientes().filter(c => !c.activo).length,
  }));

  readonly filtrados = computed(() => {
    const q = this.query().toLowerCase().trim();
    const f = this.filter();
    let list = this.clientes();
    if (f === 'active')     list = list.filter(c => c.activo && this.onboardingOf(c).completados === 7);
    if (f === 'onboarding') list = list.filter(c => c.activo && this.onboardingOf(c).completados < 7);
    if (f === 'inactive')   list = list.filter(c => !c.activo);
    if (q) list = list.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
    return list;
  });

  readonly grupos = computed((): Grupo[] => {
    const f    = this.filter();
    const q    = this.query();
    const list = this.filtrados();
    if (f !== 'all' || q) return [{ id: 'all', titulo: '', dot: '', items: list }];
    return [
      { id: 'atencion',    titulo: 'Necesitan atención', dot: 'warn',  items: list.filter(c => c.activo && this.onboardingOf(c).completados < 7)  },
      { id: 'seguimiento', titulo: 'En seguimiento',     dot: '',      items: list.filter(c => c.activo && this.onboardingOf(c).completados === 7) },
      { id: 'inactivos',   titulo: 'Inactivos',          dot: 'muted', items: list.filter(c => !c.activo)                                         },
    ].filter(g => g.items.length > 0);
  });

  readonly pendientesOnboarding = computed(() =>
    this.clientes()
      .filter(c => c.activo && this.onboardingOf(c).completados < 7)
      .sort((a, b) => this.onboardingOf(a).completados - this.onboardingOf(b).completados)
      .slice(0, 5)
  );

  constructor(
    private clienteService: ClienteService,
    private auth:           AuthService,
    private themeService:   ThemeService,
    private router:         Router,
    private alertCtrl:      AlertController,
  ) {
    addIcons({
      leafOutline, peopleOutline, calendarOutline, constructOutline,
      settingsOutline, logOutOutline, addOutline, searchOutline,
      filterOutline, swapVerticalOutline, notificationsOutline,
      sunnyOutline, moonOutline, arrowUpOutline, arrowDownOutline,
      removeOutline, checkmarkCircleOutline, personAddOutline,
      alertCircleOutline, trendingUpOutline, timeOutline,
      calendarClearOutline, eyeOutline, chatbubbleOutline,
      ellipsisHorizontalOutline, chevronBackOutline, refreshOutline, closeOutline,
    });
  }

  ngOnInit(): void { this.loadClientes(); }

  private loadClientes(): void {
    this.viewState.set('loading');
    this.clienteService.getAll().subscribe({
      next: (list) => this.viewState.set(list.length === 0 ? 'empty' : 'loaded'),
      error: ()     => this.viewState.set('error'),
    });
  }

  retryLoad():    void { this.loadClientes(); }
  openDrawer():   void { this.drawerOpen.set(true); }
  closeDrawer():  void { this.drawerOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscKey(): void { if (this.drawerOpen()) this.closeDrawer(); }

  setFilter(f: Filter): void { this.filter.set(f); }
  setQuery(q: string):  void { this.query.set(q); }
  toggleCollapsed():    void { this.collapsed.update(v => !v); }
  setThemeDark():       void { this.themeService.setTheme(true); }
  setThemeLight():      void { this.themeService.setTheme(false); }

  irNuevo():             void { this.router.navigate(['/clientes/nuevo']); }
  irDetalle(id: string): void { this.router.navigate(['/clientes', id]); }

  async confirmarLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header:  '¿Cerrar sesión?',
      message: 'Tendrás que volver a ingresar tus credenciales para continuar.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: () => this.auth.logout() },
      ],
    });
    await alert.present();
  }

  onboardingOf(c: Cliente): OnboardingStatus {
    const pasos = [
      !!(c.nombre && c.email),
      !!(c.pesoInicial && c.altura),
      !!(c.fotoPerfil),
      false,
      false,
      !!c.parqAprobado,
      !!c.consentimientoFirmado,
    ];
    return { completados: pasos.filter(Boolean).length, total: 7, pasos };
  }

  initials(c: Cliente): string {
    const parts = `${c.nombre} ${c.apellido}`.trim().split(/\s+/).filter(Boolean);
    return `${parts[0]?.[0] ?? '?'}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  avatarClass(c: Cliente): string {
    const idx = parseInt(c.id.replace(/-/g, '').slice(0, 4), 16) % 7;
    return ['', 'alt-1', 'alt-2', 'alt-3', 'alt-4', 'alt-5', 'alt-6'][idx];
  }

  weeksWith(c: Cliente): number {
    const ms = Date.now() - new Date(c.creadoEn).getTime();
    return Math.max(0, Math.floor(ms / 604_800_000));
  }

  creadoEsteMes(c: Cliente): boolean {
    const d = new Date(c.creadoEn);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
  }

  userInitials(): string {
    const name  = this.userName() ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return `${parts[0]?.[0] ?? '?'}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  onboardingPct(c: Cliente): number {
    const ob = this.onboardingOf(c);
    return (ob.completados / ob.total) * 100;
  }
}
