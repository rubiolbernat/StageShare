import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashLayoutService } from '../../../core/services/dash-layout-service';

@Component({
  selector: 'app-aside',
  imports: [RouterLink],
  templateUrl: './aside.html',
  styleUrl: './aside.css'
})
export class Aside {
  constructor(public router: Router) { }

  private LayoutService = inject(DashLayoutService)

  toggleAside() {
    this.LayoutService.toggleAside();
  }

  toggleAsideMobile() {
    this.LayoutService.toggleAside();
  }

  getAside() {
    return this.LayoutService.getisAside()
  }

  onResize($event: Event): void {
    this.LayoutService.closeAside()
  }
}
