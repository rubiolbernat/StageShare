import { environment } from './../../../../environments/environment';
import { Component, inject } from '@angular/core';
import { TabsService } from '../../../core/services/tab-service';
import { CommonModule } from '@angular/common';
import { AppTab } from '../../../core/models/app-tab.model';


@Component({
  selector: 'app-tabs',
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css'
})
export class Tabs {
  environment = environment
  tabsService = inject(TabsService);

  closeTab(tab: AppTab) {
    if (!tab) return;
    if (!tab.canSave) {
      this.tabsService.closeTab(tab.id);
      return;
    }
    if (tab.saved) {
      this.tabsService.closeTab(tab.id);
    } else {
      if (confirm('Aquest tab no està guardat. Vols tancar-lo sense guardar?')) {
        this.tabsService.closeTab(tab.id);
      }
    }
  }

  activateTab(id: string) {
    this.tabsService.activateTab(id);
  }

  viewdatasaved() {
    this.tabsService.viewTabsDataSaved();
  }
}
