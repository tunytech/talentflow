import { Injectable, signal, effect } from '@angular/core';

export interface Theme {
  name: string;
  displayName: string;
  isDark: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public readonly themes: Theme[] = [
    { name: 'midnight-tech', displayName: 'Midnight Tech (Sombre)', isDark: true },
    { name: 'corporate-pure', displayName: 'Corporate Pure (Clair)', isDark: false },
    { name: 'emerald-eco', displayName: 'Emerald Eco (Vert Nature)', isDark: false },
    { name: 'sunset-glow', displayName: 'Sunset Glow (Chaud)', isDark: true },
    { name: 'royal-amethyst', displayName: 'Royal Amethyst (Prune)', isDark: true }
  ];

  private readonly activeThemeName = signal<string>(this.getInitialTheme());

  public readonly currentThemeName = this.activeThemeName.asReadonly();

  constructor() {
    // Automatically apply theme changes to the HTML element
    effect(() => {
      const theme = this.activeThemeName();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('talentflow-theme', theme);
    });
  }

  private getInitialTheme(): string {
    const savedTheme = localStorage.getItem('talentflow-theme');
    if (savedTheme && this.themes.some(t => t.name === savedTheme)) {
      return savedTheme;
    }
    return 'corporate-pure'; // Default theme
  }

  public setTheme(themeName: string): void {
    if (this.themes.some(t => t.name === themeName)) {
      this.activeThemeName.set(themeName);
    }
  }
}
