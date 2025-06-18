import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashLayoutService {
  private expandAside = signal<boolean>(false)

  getisAside() {
    return this.expandAside()
  }

  toggleAside() {
    this.expandAside.set(!this.expandAside())
  }

  closeAside() {
    this.expandAside.set(false)
  }

  // SYSTEM OPTION SERVICE
  private isDarkTheme = signal<boolean>(false);
  private isSysTheme = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkMode(true);
    }
    if (savedTheme != null) {
      this.isSysTheme.set(true)
    }
  }

  getIsDarkTheme(): boolean {
    return this.isDarkTheme();
  }

  getIsSysTheme():boolean{
    return this.isSysTheme()
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkTheme.set(isDark);
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
    this.isSysTheme.set(false)
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkTheme());
    this.isSysTheme.set(false)
  }

  setSystemTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDarkMode(prefersDark);
    this.isSysTheme.set(true)
  }

}
