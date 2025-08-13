import { Component, inject, signal } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { DashLayoutService } from '../../../core/services/dash-layout-service';
import { TabsService } from '../../../core/services/tab-service';

@Component({
  selector: 'app-aside',
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css'
})
export class Aside {
  constructor(public router: Router) { }

  private tabsService = inject(TabsService)
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
  openSubmenu(id: number) {
    this.Submenu.update(current => {
      const newState = [...current];
      newState[id] = true;
      return newState;
    });
  }

  closeSubmenus() {
    this.Submenu.set(Array(this.NSubmenus).fill(false));
  }

  getSubmenuState(id: number) {
    return this.Submenu()[id]
  }

  leaveAside() {
    if (!this.LayoutService.getisAside()) {
      this.closeSubmenus();
    }
  }


  // OPENTABS
  deactivateTab() {
    this.tabsService.deactivateTabs();
  }

  openWeightCalculator() {
    const uniqueId = Date.now();
    this.tabsService.openTab({
      id: `${uniqueId}`,
      route: `/toolbox/loaddistribution/${uniqueId}`, // per tenir ruta única
      title: `Calculadora`,
      icon: 'calculator-fill',
      component: 'CalculatorComponent',
      allowMultiple: true
    });
  }

  openDistributionCalculator() {
    const uniqueId = Date.now();
    this.tabsService.openTab({
      id: `${uniqueId}`,
      route: `/toolbox/distribution/${uniqueId}`, // per tenir ruta única
      title: `Distribució`,
      icon: 'rulers',
      component: 'Distribution',
      allowMultiple: true
    });
  }

  openProject(id: number) {
    this.tabsService.openTab({
      id: `project-${id}`,
      route: `/project/${id}`,
      title: `Projecte ${id}`,
      component: 'ProjectComponent',
      allowMultiple: false
    });
  }
}
