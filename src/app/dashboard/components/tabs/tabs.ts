import { TabService } from './../../../core/services/tab';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css'
})
export class Tabs {
  tabService = inject(TabService);


}
