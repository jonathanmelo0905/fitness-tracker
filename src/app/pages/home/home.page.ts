import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  nutritionOutline, bodyOutline, arrowForwardOutline, fitnessOutline, settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton],
})
export class HomePage {
  constructor(private router: Router) {
    addIcons({ nutritionOutline, bodyOutline, arrowForwardOutline, fitnessOutline, settingsOutline });
  }

  irCalculadora() { this.router.navigate(['/calculator']); }
  irEvaluacion()  { this.router.navigate(['/physical-evaluation']); }
  irSettings()    { this.router.navigate(['/settings']); }
}
