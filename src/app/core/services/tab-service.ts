import { AlertService } from './alert';
import { Injectable, signal, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AppTab } from '../models/app-tab.model';

@Injectable({ providedIn: 'root' })
export class TabsService {
  private routeprefix!: string;

  private alertService = inject(AlertService);

  private tabsSignal = signal<AppTab[]>([]);
  private activeTabIdSignal = signal<string | null>(null);
  private tabCounter = 0; // per ID únics quan allowMultiple = true

  tabs = computed(() => this.tabsSignal());
  activeTabId = computed(() => this.activeTabIdSignal());
  activeTab = computed(() => this.tabsSignal().find(t => t.id === this.activeTabIdSignal()) || null);

  constructor(private router: Router) { }

  setRoutePrefix(prefix: string) {
    this.routeprefix = prefix;
  }

  getRoutePrefix() {
    return this.routeprefix;
  }

  deactivateTabs() {
    this.activeTabIdSignal.set(null);
  }

  openTab(tab: AppTab) {
    const maxTabs = 10;
    if (this.tabLenght() >= maxTabs) {
      console.warn(`Maximum number of tabs reached (${maxTabs}). Cannot open more tabs.`);
      this.alertService.addAlert({
        type: 'warning',
        title: 'Nombre màxim de pestanyes',
        message: `S’ha arribat al nombre màxim de pestanyes (${maxTabs}). No es poden obrir més pestanyes.`
      });
      return;
    }

    if (!tab.allowMultiple) {
      const existing = this.tabsSignal().find(t => t.id === tab.id || t.route === tab.route);
      if (existing) {
        this.activateTab(existing.id);
        return;
      }
    } else {
      // Obtenim tots els tabs que comencen amb aquest id base
      const baseId = tab.id;
      const matchingTabs = this.tabsSignal().filter(t => t.id === baseId || t.id.startsWith(baseId + '-'));

      if (matchingTabs.length > 0) {
        // Trobar el número més alt ja usat
        const maxNumber = matchingTabs
          .map(t => {
            const parts = t.id.split('-');
            const lastPart = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : 0;
            return isNaN(lastPart) ? 0 : lastPart;
          })
          .reduce((max, n) => Math.max(max, n), 0);

        tab.id = `${baseId}-${maxNumber + 1}`;
      }

      // Actualitzar també la ruta
      const baseRoute = tab.route.split('/').slice(0, -1).join('/');
      tab.route = `${baseRoute}/${tab.id}`;
    }

    // Afegir el prefix si existeix
    if (this.routeprefix) {
      // Evitar doble barra
      tab.route = `${this.routeprefix.replace(/\/$/, '')}/${tab.route.replace(/^\//, '')}`;
    }

    this.tabsSignal.update(tabs => [...tabs, tab]);
    this.activateTab(tab.id);
  }

  closeTab(id: string) {
    const currentTabs = this.tabsSignal();
    const index = currentTabs.findIndex(t => t.id === id);
    if (index === -1) return;

    const isActive = this.activeTabIdSignal() === id;
    const newTabs = currentTabs.filter(t => t.id !== id);
    this.tabsSignal.set(newTabs);

    if (isActive && newTabs.length > 0) {
      const newIndex = index > 0 ? index - 1 : 0;
      this.activateTab(newTabs[newIndex].id);
    }
  }

  activateTab(id: string) {
    // Find the tab object that matches the given ID
    const tab = this.tabsSignal().find(t => t.id === id);

    if (!tab) {
      console.warn(`Tab with ID ${id} not found.`);
      return;
    }

    if (tab.allowMultiple) {
      // Update the active tab ID signal
      this.activeTabIdSignal.set(id);

      // 🔹 Always force navigation for tabs that allow multiple instances
      // Append a unique query parameter (?refresh=timestamp) so Angular treats it as a different route
      const finalRoute = tab.route + '?rfh=' + Date.now().toString().substring(0, 3);

      // Navigate to a temporary route ("/") without updating the browser's address bar
      // skipLocationChange: true → tells Angular to perform the navigation
      // without pushing a new entry into the browser's history and without
      // changing the visible URL. The navigation still happens internally,
      // so components are destroyed/recreated as usual.
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        // Navigate to the final target route with the unique refresh parameter
        this.router.navigateByUrl(finalRoute);
      });

    } else {
      // For tabs that don't allow multiple instances, only navigate if the route changes
      this.activeTabIdSignal.set(id);

      if (this.router.url !== tab.route) {
        console.log(`Navigating to route: ${tab.route}`);
        this.router.navigateByUrl(tab.route);
      }
    }
  }

  updateTabData(id: string, data: any) {
    console.log(`SERVICE - Updating data for tab ${id}:`, data);
    this.tabsSignal.update(tabs =>
      tabs.map(t => t.id === id ? { ...t, componentData: data } : t)
    );
  }

  getTabData(id: string): any {
    const tab = this.tabsSignal().find(t => t.id === id);
    console.log(`SERVICE - Getting data for tab ${id} data:`, tab ? tab.componentData : null);
    return tab ? tab.componentData : null;
  }

  markSaved(id: string, saved: boolean) {
    this.tabsSignal.update(tabs =>
      tabs.map(t => t.id === id ? { ...t, saved } : t)
    );
  }

  viewTabsDataSaved() {
    //View data saved for all tabs
    this.tabsSignal().forEach(tab => {
      if (tab.saved) {
        console.log(`Tab ${tab.id} data:`, tab.componentData);
      } else {
        console.log(`Tab ${tab.id} is not saved.`);
      }
    });
    this.alertService.addAlert({
      type: 'info',
      title: 'Dades de les pestanyes',
      message: 'S’ha mostrat la informació de les dades guardades de totes les pestanyes a la consola',
      duration: 9000
    });


  }

  tabLenght() {
    return this.tabsSignal().length;
  }

  isTabActive(id: string): boolean {
    return this.activeTabIdSignal() === id;
  }

  setTabTitle(id: string, title: string) {
    this.tabsSignal.update(tabs =>
      tabs.map(t => t.id === id ? { ...t, title } : t)
    );
  }

  setTabInfo(id: string, info: string) {
    this.tabsSignal.update(tabs =>
      tabs.map(t => t.id === id ? { ...t, info } : t)
    );
  }
}

