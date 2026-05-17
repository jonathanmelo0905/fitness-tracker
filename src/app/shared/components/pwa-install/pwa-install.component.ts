import { Component, OnInit, signal } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, shareOutline, addCircleOutline } from 'ionicons/icons';

type PwaMode = 'none' | 'android' | 'ios';

const DISMISSED_KEY = 'nutrieval-pwa-dismissed';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './pwa-install.component.html',
  styleUrl: './pwa-install.component.scss',
})
export class PwaInstallComponent implements OnInit {
  private deferredPrompt = signal<any>(null);
  protected readonly mode = signal<PwaMode>('none');

  constructor() {
    addIcons({ closeOutline, shareOutline, addCircleOutline });
  }

  ngOnInit(): void {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone || localStorage.getItem(DISMISSED_KEY)) return;

    const ua = navigator.userAgent;
    const isIos =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);

    if (isIos && isSafari) {
      this.mode.set('ios');
      return;
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt.set(e);
      this.mode.set('android');
    });
  }

  protected async install(): Promise<void> {
    const prompt = this.deferredPrompt();
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') this.dismiss();
  }

  protected dismiss(): void {
    localStorage.setItem(DISMISSED_KEY, '1');
    this.mode.set('none');
  }
}
