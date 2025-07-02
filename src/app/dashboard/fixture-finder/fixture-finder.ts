import { Component, inject, signal } from '@angular/core';
import { GdtfDataService } from '../../core/services/gdtf-service';
import { gdtfFixtures, gdtfMode, gdtfChannels } from '../../core/models/gdtf_db.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fixture-finder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fixture-finder.html',
  styleUrl: './fixture-finder.css'
})
export class FixtureFinder {
  private fixtureService = inject(GdtfDataService);

  // Signals for search inputs
  searchName = signal<string>('');
  searchManufacturer = signal<string>('');
  searchCreator = signal<string>('');
  searchByChannels = signal<gdtfChannels[]>([{ channel_number: null, attribute: '', name: '' }]);

  // Signals for results and UI state
  searchResults = signal<gdtfFixtures[]>([]);
  isLoading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  selectedFixture = signal<gdtfFixtures | null>(null);

  // Add a new channel row
  addChannel() {
    this.searchByChannels.update(channels => [...channels, { channel_number: null, attribute: '', name: '' }]);
  }

  // Remove a channel row
  removeChannel(indexToRemove: number) {
    this.searchByChannels.update(currentChannels =>
      currentChannels.filter((_, index) => index !== indexToRemove)
    );
  }

  // Perform basic search
  performSearch() {
    this.isLoading.set(true);
    this.searchResults.set([]);

    const filters = {
      name: this.searchName(),
      manufacturer: this.searchManufacturer(),
      creator: this.searchCreator()
    };

    this.fixtureService.searchFixtures(filters).pipe(
      // Opcional: puedes añadir operadores RXJS aquí
      // catchError(err => of([])), // Manejo de errores alternativo
      // finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (results) => this.searchResults.set(results),
      error: (error) => {
        console.error('Error searching fixtures:', error);
        this.searchResults.set([]);
      },
      complete: () => this.isLoading.set(false)
    });
  }

  // Perform channel search
  performChannelSearch() {
    const channelConditions = this.searchByChannels().filter(channel =>
      channel.channel_number || channel.attribute || channel.name
    );

    if (channelConditions.length === 0) {
      alert('Please enter at least one channel condition');
      return;
    }

    this.isLoading.set(true);
    this.searchResults.set([]);

    this.fixtureService.searchByChannels(channelConditions).subscribe({
      next: (results) => this.searchResults.set(results),
      error: (error) => {
        console.error('Error searching by channels:', error);
        this.searchResults.set([]);
      },
      complete: () => this.isLoading.set(false)
    });
  }

  updateChannelField(index: number, field: keyof gdtfChannels, value: any) {
    this.searchByChannels.update(channels => {
      const updatedChannels = [...channels];
      updatedChannels[index] = {
        ...updatedChannels[index],
        [field]: value
      };
      return updatedChannels;
    });
  }

  // Open modal with fixture details
  openDetailsModal(fixture: gdtfFixtures) {
    this.selectedFixture.set(fixture);
    this.showModal.set(true);
  }

  // Close modal
  closeModal() {
    this.showModal.set(false);
    this.selectedFixture.set(null);
  }

  // Download GDTF file
  downloadGdtf(fixture: gdtfFixtures) {
    console.log('Downloading GDTF for:', fixture.name);

    this.fixtureService.downloadFixture(fixture.id).subscribe({
      next: () => {
        console.log('Download completed');
        // Puedes añadir aquí notificaciones al usuario
      },
      error: (err: Error) => {
        console.error('Download failed:', err);
        // Manejo de errores (mostrar mensaje al usuario)
      }
    });
  }

  // Añade esto a la clase FixtureFinder
  getRatingStars(rating: number = 0): { full: number; half: boolean; empty: number } {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return {
    full: fullStars,
    half: hasHalfStar,
    empty: emptyStars
  };
}

  // Para el contador de resultados en el template
  get resultCount(): string {
    const count = this.searchResults().length;
    return `${count} ${count === 1 ? 'fixture' : 'fixtures'}`;
  }

  collapsedModes = signal<Set<number>>(new Set());

  toggleModeCollapse(modeId: number) {
    this.collapsedModes.update(current => {
      const newSet = new Set(current);
      if (newSet.has(modeId)) {
        newSet.delete(modeId);
      } else {
        newSet.add(modeId);
      }
      return newSet;
    });
  }

  isModeCollapsed(modeId: number): boolean {
    return !this.collapsedModes().has(modeId);
  }
}
