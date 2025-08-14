import { Component, inject } from '@angular/core';
import { Header } from '../../landing/components/header/header';
import { Footer } from '../../landing/components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { DashLayoutService } from '../../core/services/dash-layout-service';

@Component({
  selector: 'app-landing-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.css'
})
export class LandingLayout {
  private LayoutService = inject(DashLayoutService)
  isDarkMode() {
    return this.LayoutService.getIsDarkTheme();
  }
}
