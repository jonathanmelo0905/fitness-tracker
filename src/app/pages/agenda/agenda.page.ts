import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-agenda',
  templateUrl: 'agenda.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class AgendaPage {}
