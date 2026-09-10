import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkMode = signal(localStorage.getItem('theme') === 'dark');
  isDarkMode$ = this.isDarkMode.asReadonly();

  constructor() {
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode.update(val => !val);
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.isDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  getCurrentTheme() {
    return this.isDarkMode();
  }
}