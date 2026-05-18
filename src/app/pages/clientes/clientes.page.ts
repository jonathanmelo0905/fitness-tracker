import { Component, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonSearchbar, IonList, IonItem, IonLabel, IonBadge,
  IonIcon, IonSpinner, IonFab, IonFabButton,
  IonGrid, IonRow, IonCol,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, peopleOutline, logOutOutline } from 'ionicons/icons';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { Cliente } from '../../shared/models/cliente.model';

@Component({
  selector: 'app-clientes',
  templateUrl: 'clientes.page.html',
  styleUrls: ['clientes.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonSearchbar, IonList, IonItem, IonLabel, IonBadge,
    IonIcon, IonSpinner, IonFab, IonFabButton,
    IonGrid, IonRow, IonCol,
  ],
})
export class ClientesPage implements OnInit {
  readonly loading  = signal(true);
  readonly query    = signal('');

  readonly clientes = this.clienteService.clientes;
  readonly userName = this.auth.userName;

  readonly stats = computed(() => {
    const list = this.clientes();
    const now = new Date();
    const mesActual = now.getFullYear() * 12 + now.getMonth();
    return {
      total:   list.length,
      activos: list.filter(c => c.activo).length,
      nuevos:  list.filter(c => {
        const d = new Date(c.creadoEn);
        return d.getFullYear() * 12 + d.getMonth() === mesActual;
      }).length,
    };
  });

  readonly filtrados = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  constructor(
    private clienteService: ClienteService,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
  ) {
    addIcons({ addOutline, peopleOutline, logOutOutline });
  }

  ngOnInit(): void {
    this.clienteService.getAll().subscribe({
      next:  () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  async confirmarLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header:  '¿Cerrar sesión?',
      message: 'Tendrás que volver a ingresar tus credenciales para continuar.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text:    'Cerrar sesión',
          role:    'destructive',
          handler: () => this.auth.logout(),
        },
      ],
    });
    await alert.present();
  }

  initials(c: Cliente): string {
    return `${c.nombre[0]}${c.apellido[0]}`.toUpperCase();
  }

  irNuevo():             void { this.router.navigate(['/clientes/nuevo']); }
  irDetalle(id: number): void { this.router.navigate(['/clientes', id]); }
}
