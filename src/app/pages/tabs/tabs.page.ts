import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, constructOutline, calendarOutline, settingsOutline, logOutOutline, leafOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
  ],
})
export class TabsPage {
  readonly userName = this.auth.userName;

  constructor(
    private auth: AuthService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ peopleOutline, constructOutline, calendarOutline, settingsOutline, logOutOutline, leafOutline });
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
}
