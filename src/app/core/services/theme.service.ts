import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = signal<boolean>(true);

  readonly currentTheme = computed(() => this.isDark() ? 'dark' : 'light');

  constructor() {
    const saved = localStorage.getItem('ft-theme');
    if (saved) {
      this.isDark.set(saved === 'dark');
    }
    this.applyTheme(this.isDark());
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
    this.applyTheme(this.isDark());
    localStorage.setItem('ft-theme', this.isDark() ? 'dark' : 'light');
  }

  setTheme(dark: boolean): void {
    this.isDark.set(dark);
    this.applyTheme(dark);
    localStorage.setItem('ft-theme', dark ? 'dark' : 'light');
  }

  isDarkTheme(): boolean {
    return this.isDark();
  }

  private applyTheme(dark: boolean): void {
    const body = document.body;
    if (dark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}
