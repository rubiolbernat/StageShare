import { TabsService } from './../../../core/services/tab-service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface Distributions {
  [key: number]: number[];
}

@Component({
  selector: 'app-loads',
  imports: [CommonModule, FormsModule],
  templateUrl: './loads.html',
  styleUrl: './loads.css'
})
export class Loads implements OnInit {
  private tabsService = inject(TabsService);
  private route = inject(ActivatedRoute);

  tabId = '';

  totalWeight: number | null = null;
  supportPoints: number | null = null;
  loadType: 'distributed' | 'point' = 'distributed';

  showResults = false;
  previewPercentages: number[] = [];
  calculatedDistribution: { weight: number; percentage: number }[] = [];

  private readonly distributedLoadDistributions: Distributions = {
    1: [100],
    2: [50, 50],
    3: [19, 62, 19],
    4: [13, 37, 37, 13],
    5: [10, 28, 24, 28, 10],
    6: [8, 23, 19, 19, 23, 8],
    7: [7, 19, 15, 18, 15, 19, 7],
    8: [6, 16, 14, 14, 14, 14, 16, 6]
  };

  ngOnInit() {
    this.tabId = this.route.snapshot.paramMap.get('id') || '';

    const savedState = this.tabsService.getTabData(this.tabId);
    console.log('Loaded state for tab:', this.tabId, savedState);

    if (savedState) {
      this.totalWeight = savedState.totalWeight;
      this.supportPoints = savedState.supportPoints;
      this.loadType = savedState.loadType;
      this.showResults = savedState.showResults;
      this.previewPercentages = savedState.previewPercentages;
      this.calculatedDistribution = savedState.calculatedDistribution;
    }
  }

  private saveState() {
    // Comprovació per seguretat
    if (!this.tabId) return;

    const state = {
      totalWeight: this.totalWeight,
      supportPoints: this.supportPoints,
      loadType: this.loadType,
      showResults: this.showResults,
      previewPercentages: this.previewPercentages,
      calculatedDistribution: this.calculatedDistribution
    };

    // 1. Actualitzes les dades del component (això ja ho feies)
    this.tabsService.updateTabData(this.tabId, state);

    // 2. Notifiques al servei que la pestanya està oficialment guardada (AQUESTA ÉS LA LÍNIA NOVA)
    this.tabsService.markSaved(this.tabId, true);

    // El teu log per depurar
    console.log(`State saved for tab ${this.tabId}:`, state);
  }
  
  onFormChange(): void {
    this.updatePreviewPercentages();
    if (this.totalWeight && this.supportPoints) {
      this.calculateDistribution(false);
    }
    this.saveState();
  }

  private updatePreviewPercentages(): void {
    if (!this.supportPoints) {
      this.previewPercentages = [];
      return;
    }

    if (this.loadType === 'distributed') {
      if (this.supportPoints <= 8) {
        this.previewPercentages = this.distributedLoadDistributions[this.supportPoints] || [];
      } else {
        this.previewPercentages = this.generateSymmetricDistribution(this.supportPoints);
      }
    } else {
      this.previewPercentages = this.getPointLoadDistribution(this.supportPoints);
    }
  }

  calculateDistribution(show: boolean = true): void {
    if (!this.totalWeight || !this.supportPoints) {
      alert('Si us plau, introdueix valors vàlids.');
      return;
    }

    this.updatePreviewPercentages();

    this.calculatedDistribution = this.previewPercentages.map(p => ({
      weight: this.totalWeight! * (p / 100),
      percentage: p
    }));

    this.calculatedDistribution.length = this.supportPoints;
    this.showResults = show;

    this.saveState();
  }

  private generateSymmetricDistribution(n: number): number[] {
    if (n <= 0) return [];

    const values = [];
    const mid = (n - 1) / 2;
    const offset = 0.2;

    for (let i = 0; i < n; i++) {
      const normalizedDist = 1 - Math.pow((i - mid) / mid, 2);
      const weight = offset + normalizedDist * (1 - offset);
      values.push(weight);
    }

    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => (v / total) * 100);

    const rounded = percentages.map(p => Math.round(p));
    const diff = 100 - rounded.reduce((a, b) => a + b, 0);
    if (diff !== 0) {
      const center = Math.floor(n / 2);
      rounded[center] += diff;
    }

    return rounded;
  }

  private getPointLoadDistribution(points: number): number[] {
    if (points <= 0) return [];

    const distribution = Array.from({ length: points }, () => 0);

    if (points % 2 === 0) {
      const centerLeft = points / 2 - 1;
      const centerRight = points / 2;
      distribution[centerLeft] = 50;
      distribution[centerRight] = 50;
    } else {
      const center = Math.floor(points / 2);
      distribution[center] = 100;
    }

    return distribution;
  }

  isCentralPoint(index: number): boolean {
    if (!this.supportPoints || this.loadType !== 'point') return false;
    const points = this.supportPoints;
    if (points % 2 === 1) return index === Math.floor(points / 2);
    return index === points / 2 - 1 || index === points / 2;
  }

  printResults(): void {
    window.print();
  }
}
