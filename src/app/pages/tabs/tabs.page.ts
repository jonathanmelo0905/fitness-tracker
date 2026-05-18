import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, constructOutline, calendarOutline, settingsOutline, logOutOutline,
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

  constructor(private auth: AuthService) {
    addIcons({ peopleOutline, constructOutline, calendarOutline, settingsOutline, logOutOutline });
  }

  logout(): void {
    this.auth.logout();
  }
}
