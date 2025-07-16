import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Distributions {
  [key: number]: number[];
}

@Component({
  selector: 'app-loads',
  imports: [CommonModule, FormsModule],
  templateUrl: './loads.html',
  styleUrl: './loads.css'
})
export class Loads {
  totalWeight: number | null = null;
  supportPoints: number | null = null;
  loadType: 'distributed' | 'point' = 'distributed';

  showResults = false;
  previewPercentages: number[] = [];
  calculatedDistribution: { weight: number; percentage: number }[] = [];

  private readonly distributedLoadDistributions: Distributions = {
    1: [100], 2: [50, 50], 3: [19, 62, 19], 4: [13, 37, 37, 13],
    5: [10, 28, 24, 28, 10], 6: [8, 23, 19, 19, 23, 8],
    7: [7, 19, 15, 18, 15, 19, 7], 8: [6, 16, 14, 14, 14, 14, 16, 6]
  };

  private generateSymmetricDistribution(n: number): number[] {
    if (n <= 0) return [];

    const values = [];
    const mid = (n - 1) / 2;
    const offset = 0.2; // mínim pes a extrems, ajustable

    for (let i = 0; i < n; i++) {
      const normalizedDist = 1 - Math.pow((i - mid) / mid, 2);
      const weight = offset + normalizedDist * (1 - offset);
      values.push(weight);
    }

    // Normalitzar a 100%
    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => (v / total) * 100);

    // Redondejar i ajustar la suma a 100
    const rounded = percentages.map(p => Math.round(p));
    const diff = 100 - rounded.reduce((a, b) => a + b, 0);
    if (diff !== 0) {
      const center = Math.floor(n / 2);
      rounded[center] += diff;
    }

    return rounded;
  }


  /**
   * Actualitza la previsualització cada cop que canvia el formulari.
   */
  onFormChange(): void {
    this.showResults = false;
    this.updatePreviewPercentages();
  }

  /**
   * Funció central per actualitzar l'array de la previsualització.
   */
  private updatePreviewPercentages(): void {
    if (!this.supportPoints) {
      this.previewPercentages = [];
      return;
    }

    if (this.loadType === 'distributed') {
      if (this.supportPoints <= 8) {
        this.previewPercentages = this.distributedLoadDistributions[this.supportPoints] || [];
      } else {
        // Per a més de 8 punts, generem una distribució simètrica
        this.previewPercentages = this.generateSymmetricDistribution(this.supportPoints);
      }
    } else {
      // CRIDEM LA VERSIÓ CORREGIDA DE LA FUNCIÓ
      this.previewPercentages = this.getPointLoadDistribution(this.supportPoints);
    }
    // Per depurar: pots veure a la consola del navegador l'array que es genera
    console.log('Array de previsualització generat:', this.previewPercentages);
  }

  /**
   * Calcula els resultats finals basant-se en l'array de previsualització.
   */
  calculateDistribution(): void {
    if (!this.totalWeight || !this.supportPoints) {
      alert('Si us plau, introdueix valors vàlids.');
      return;
    }

    this.updatePreviewPercentages();

    this.calculatedDistribution = this.previewPercentages.map(p => ({
      weight: this.totalWeight! * (p / 100),
      percentage: p
    }));

    // ✨ Garanteix que hi hagi tots els punts, encara que el pes sigui 0
    this.calculatedDistribution.length = this.supportPoints;

    this.showResults = true;
  }


  /**
   * AQUESTA ÉS LA FUNCIÓ CORREGIDA I DEFINITIVA.
   * Garanteix que es crea un array de la mida correcta i es retorna SEMPRE.
   */
  private getPointLoadDistribution(points: number): number[] {
    if (points <= 0) return [];

    // Genera un array de longitud 'points' amb tots els valors inicialitzats a 0
    const distribution = Array.from({ length: points }, () => 0);

    if (points % 2 === 0) {
      // Si és parell: reparteix 50% als dos punts centrals
      const centerLeft = points / 2 - 1;
      const centerRight = points / 2;
      distribution[centerLeft] = 50;
      distribution[centerRight] = 50;
    } else {
      // Si és senar: dona 100% al punt central
      const center = Math.floor(points / 2);
      distribution[center] = 100;
    }

    console.log('Distribució de càrrega puntual generada:', distribution);
    console.log('Punts de suport:', points);
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
