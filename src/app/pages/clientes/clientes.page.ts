import { Component, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonList, IonItem, IonLabel, IonBadge,
  IonIcon, IonSpinner, IonFab, IonFabButton,
  IonGrid, IonRow, IonCol, IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, personOutline, alertCircleOutline } from 'ionicons/icons';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../shared/models/cliente.model';

@Component({
  selector: 'app-clientes',
  templateUrl: 'clientes.page.html',
  styleUrls: ['clientes.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonList, IonItem, IonLabel, IonBadge,
    IonIcon, IonSpinner, IonFab, IonFabButton,
    IonGrid, IonRow, IonCol, IonButton,
  ],
})
export class ClientesPage implements OnInit {
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);
  readonly query   = signal('');

  readonly clientes = this.clienteService.clientes;

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
    private router: Router,
  ) {
    addIcons({ addOutline, personOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.clienteService.getAll().subscribe({
      next:  () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los clientes. Verifica tu conexión.');
      },
    });
  }

  initials(c: Cliente): string {
    return `${c.nombre[0]}${c.apellido[0]}`.toUpperCase();
  }

  irNuevo():             void { this.router.navigate(['/clientes/nuevo']); }
  irDetalle(id: number): void { this.router.navigate(['/clientes', id]); }
}
