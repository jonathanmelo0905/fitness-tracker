import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonList, IonListHeader, IonItem, IonLabel, IonToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, moonOutline, sunnyOutline, fitnessOutline,
  codeOutline, shieldCheckmarkOutline, settingsOutline,
} from 'ionicons/icons';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonList, IonListHeader, IonItem, IonLabel, IonToggle,
  ],
})
export class SettingsPage {
  constructor(public themeService: ThemeService, private router: Router) {
    addIcons({
      arrowBackOutline, moonOutline, sunnyOutline, fitnessOutline,
      codeOutline, shieldCheckmarkOutline, settingsOutline,
    });
  }

  irInicio() { this.router.navigate(['/home']); }
}
