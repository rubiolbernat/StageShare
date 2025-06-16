import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.enableDarkMode();
    }
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  toggleDarkMode(): void {
    this.darkMode ? this.disableDarkMode() : this.enableDarkMode();
  }

  enableDarkMode(): void {
    this.darkMode = true;
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }

  disableDarkMode(): void {
    this.darkMode = false;
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }

  setSystemTheme(): void {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
    localStorage.setItem('theme', 'system');
  }
}