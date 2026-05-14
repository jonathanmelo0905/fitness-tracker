import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardContent, IonItem, IonLabel, IonIcon,
  IonBadge, IonFab, IonFabButton, IonList, IonAlert, IonButton, IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, warningOutline, bodyOutline, flameOutline,
  trendingDownOutline, nutritionOutline, refreshOutline, alertCircleOutline,
  checkmarkCircleOutline, documentOutline,
} from 'ionicons/icons';
import { FitnessResults } from '../../shared/models/client.model';
import { PdfExportService } from '../../core/services/pdf-export.service';

@Component({
  selector: 'app-results',
  templateUrl: 'results.page.html',
  styleUrls: ['results.page.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardContent, IonItem, IonLabel, IonIcon,
    IonBadge, IonFab, IonFabButton, IonList, IonAlert, IonButton, IonToast,
  ],
})
export class ResultsPage implements OnInit {
  results    = signal<FitnessResults | null>(null);
  showAlerts = signal(false);
  exportando = signal(false);
  toastOpen  = signal(false);
  toastMsg   = signal('');
  toastColor = signal<'success' | 'danger'>('success');

  constructor(
    private router: Router,
    private pdfExport: PdfExportService,
  ) {
    addIcons({
      addOutline, warningOutline, bodyOutline, flameOutline,
      trendingDownOutline, nutritionOutline, refreshOutline,
      alertCircleOutline, checkmarkCircleOutline, documentOutline,
    });
  }

  ngOnInit() {
    const nav   = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { results: FitnessResults } | undefined;
    if (state?.results) {
      this.results.set(state.results);
      if (state.results.alertas.length > 0) {
        setTimeout(() => this.showAlerts.set(true), 600);
      }
    } else {
      this.router.navigate(['/calculator']);
    }
  }

  get r(): FitnessResults {
    return this.results()!;
  }

  async exportarPDF() {
    this.exportando.set(true);
    try {
      await this.pdfExport.generarReporte(this.r.clientData, this.r);
      this.mostrarToast('✅ PDF generado correctamente', 'success');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.mostrarToast('❌ Error al generar el PDF. Inténtalo de nuevo.', 'danger');
    } finally {
      this.exportando.set(false);
    }
  }

  private mostrarToast(mensaje: string, color: 'success' | 'danger') {
    this.toastMsg.set(mensaje);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }

  imcColor(): string {
    const imc = this.r.imc;
    if (imc < 18.5) return 'warning';
    if (imc < 25)   return 'success';
    if (imc < 30)   return 'warning';
    return 'danger';
  }

  perdidaEnRango(): boolean {
    const r = this.r;
    return r.perdidaSemanalSegunDeficit >= r.reduccionSemanalMin &&
           r.perdidaSemanalSegunDeficit <= r.reduccionSemanalMax;
  }

  diasASemanasYMeses(dias: number): string {
    const semanas = Math.floor(dias / 7);
    const meses   = (dias / 30.4).toFixed(1);
    return `${Math.round(dias)} días (~${semanas} sem / ~${meses} meses)`;
  }

  hayDeficit(): boolean {
    return this.r.clientData.ajusteCalorico < 0;
  }

  alertButtons = [{ text: 'Entendido', role: 'confirm' }];

  nuevoCalculo() {
    this.router.navigate(['/calculator']);
  }
}
