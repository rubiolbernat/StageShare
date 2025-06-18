import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../dashboard/components/header/header';
import { Aside } from '../../dashboard/components/aside/aside';
import { DashLayoutService } from '../../core/services/dash-layout-service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Header, Aside],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  private LayoutService = inject(DashLayoutService)

  getAside() {
    return this.LayoutService.getisAside()
  }

  isDarkMode(){
    return this.LayoutService.getIsDarkTheme()
  }
}
