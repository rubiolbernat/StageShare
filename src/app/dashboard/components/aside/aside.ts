import { Component, inject, signal } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { DashLayoutService } from '../../../core/services/dash-layout-service';

@Component({
  selector: 'app-aside',
  imports: [RouterModule, RouterLinkActive],
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
    this.closeSubmenus();
  }

  /* Submenu */
  readonly NSubmenus: number = 2
  private Submenu = signal<boolean[]>(Array(this.NSubmenus).fill(false));

  toggleSubmenu(id: number) {
    this.Submenu.update(current => {
      const newState = [...current];
      newState[id] = !newState[id];
      return newState;
    });
  }

  closeSubmenus(){
    this.Submenu.set(Array(this.NSubmenus).fill(false));
  }

  getSubmenuState(id: number) {
    return this.Submenu()[id]
  }
}
