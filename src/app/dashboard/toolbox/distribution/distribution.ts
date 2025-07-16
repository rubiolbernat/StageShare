import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-distribution',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './distribution.html',
  styleUrl: './distribution.css'
})
export class Distribution {
  segmentLength: number = 10;
  objectCount: number = 5;
  distributionType: string = 'individual';
  startFrom: string = 'start';
  direction: string = 'forward';
  includeEdges: boolean = true;
  marginStart: number = 0;
  marginEnd: number = 0;
  // NOU: Propietat per controlar la visualització de les mesures
  showCenterMeasurements: boolean = false;

  results: number[] = [];
  spacing: number = 0;
  centerObjectInfo: { label: string; description: string; distanceToCenter: string; } | null = null;

  abs = Math.abs;

  validateDistribution() {
    if (this.distributionType === "pares" && this.objectCount % 2 !== 0) {
      alert("⚠️ Heu seleccionat distribució per parelles però el nombre d'objectes és senar.");
    } else if (this.distributionType === "tercias" && this.objectCount % 3 !== 0) {
      alert("⚠️ Heu seleccionat distribució per tèrcies però el nombre d'objectes no és múltiple de 3.");
    }
  }

  calculateDistribution() {
    if (isNaN(this.segmentLength) || this.segmentLength <= 0) {
      alert("Introduïu una longitud de segment vàlida (més gran que 0).");
      return;
    }

    if (isNaN(this.objectCount) || this.objectCount <= 0) {
      alert("Introduïu una quantitat d'objectes vàlida (més gran que 0).");
      return;
    }

    if (this.marginStart < 0 || this.marginEnd < 0) {
      alert("Els marges no poden ser negatius.");
      return;
    }

    if (this.marginStart + this.marginEnd >= this.segmentLength) {
      alert("La suma dels marges no pot ser més gran o igual que la longitud del segment.");
      return;
    }

    let groupSize = 1;
    if (this.distributionType === "pares") groupSize = 2;
    if (this.distributionType === "tercias") groupSize = 3;

    const totalGroups = Math.ceil(this.objectCount / groupSize);
    const effectiveSegmentLength = this.segmentLength - this.marginStart - this.marginEnd;

    this.spacing = this.includeEdges ? effectiveSegmentLength / Math.max(1, (totalGroups - 1)) : effectiveSegmentLength / (totalGroups + 1);

    let positions: number[] = [];
    let startPosition = this.marginStart;
    if (this.startFrom === "center") startPosition = this.segmentLength / 2;
    else if (this.startFrom === "end") startPosition = this.segmentLength - this.marginEnd;

    if (this.direction === "both" && this.startFrom === "center") {
      const halfGroups = Math.floor(totalGroups / 2);
      const isEven = totalGroups % 2 === 0;
      for (let i = -halfGroups; i <= halfGroups; i++) {
        if (i === 0 && !isEven) {
          positions.push(startPosition);
        } else if (i !== 0 || isEven) {
          const pos = startPosition + i * this.spacing;
          if (pos >= this.marginStart && pos <= this.segmentLength - this.marginEnd) {
            positions.push(pos);
          }
        }
      }
      positions.sort((a, b) => a - b);
    } else {
      const directionMultiplier = this.direction === "backward" ? -1 : 1;
      for (let i = 0; i < totalGroups; i++) {
        let position;
        if (this.startFrom === "start") {
          position = this.marginStart + (this.includeEdges ? i : i + 1) * this.spacing * directionMultiplier;
        } else if (this.startFrom === "center") {
          position = startPosition + (this.includeEdges ? i : i + 1) * this.spacing * directionMultiplier;
        } else { // end
          position = startPosition - (this.includeEdges ? i : i + 1) * this.spacing * directionMultiplier;
        }
        if (position >= this.marginStart && position <= this.segmentLength - this.marginEnd) {
          positions.push(position);
        }
      }
      if (this.direction === "backward") positions.sort((a, b) => b - a);
      else positions.sort((a, b) => a - b);
    }

    this.results = positions.slice(0, this.objectCount).map(p => Math.max(this.marginStart, Math.min(p, this.segmentLength - this.marginEnd)));

    this.calculateCenterObjectInfo();
  }

  calculateCenterObjectInfo() {
    // Si no hi ha resultats o menys de dos objectes, no hi ha res a calcular.
    if (!this.results || this.results.length <= 1) {
      this.centerObjectInfo = null;
      return;
    }

    const geometricCenter = this.segmentLength / 2;

    // Cas per a una quantitat senar d'objectes (hi ha un únic objecte central)
    if (this.objectCount % 2 === 1) {
      const centerIndex = Math.floor(this.objectCount / 2);
      const centerPos = this.results[centerIndex];

      // Determina la descripció segons si es mostren mesures des del centre
      const description = this.showCenterMeasurements
        ? `Objecte ${centerIndex + 1} a ${(centerPos - geometricCenter).toFixed(2)} metres (des del centre)`
        : `Objecte ${centerIndex + 1} a ${centerPos.toFixed(2)} metres (des de l'inici)`;

      this.centerObjectInfo = {
        label: 'Objecte central',
        description: description,
        distanceToCenter: Math.abs(centerPos - geometricCenter).toFixed(2)
      };
    }
    // Cas per a una quantitat parell d'objectes (hi ha dos objectes centrals)
    else {
      const centerRightIndex = this.objectCount / 2;
      const centerLeftIndex = centerRightIndex - 1;
      const centerLeftPos = this.results[centerLeftIndex];
      const centerRightPos = this.results[centerRightIndex];

      // Determina la descripció segons si es mostren mesures des del centre
      const description = this.showCenterMeasurements
        ? `Objecte ${centerLeftIndex + 1} a ${(centerLeftPos - geometricCenter).toFixed(2)}m i Objecte ${centerRightIndex + 1} a ${(centerRightPos - geometricCenter).toFixed(2)}m (des del centre)`
        : `Objecte ${centerLeftIndex + 1} a ${centerLeftPos.toFixed(2)}m i Objecte ${centerRightIndex + 1} a ${centerRightPos.toFixed(2)}m (des de l'inici)`;

      this.centerObjectInfo = {
        label: 'Objectes centrals',
        description: description,
        // La distància al centre geomètric és la mateixa per a tots dos objectes
        distanceToCenter: Math.abs(centerLeftPos - geometricCenter).toFixed(2)
      };
    }
  }
}
