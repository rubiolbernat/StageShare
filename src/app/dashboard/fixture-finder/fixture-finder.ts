import { Component, inject, signal } from '@angular/core';
import { GdtfDataService } from '../../core/services/gdtf-service';
import { gdtfFixtures, gdtfMode, gdtfChannels } from '../../core/models/gdtf_db.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-fixture-finder',
  imports: [CommonModule, FormsModule],
  templateUrl: './fixture-finder.html',
  styleUrl: './fixture-finder.css'
})
export class FixtureFinder {
  private fixtureService = inject(GdtfDataService);

  searchByFixture = signal<gdtfFixtures>({ id: 0, rid: 0, name: '', manufacturer: '', revision: '', creation_date: 0, last_modified: 0, uploader: '', rating: 0, version: '', creator: '', uuid: '', filesize: 0, thumbnail: null, modes: [] });
  searchByChannels = signal<gdtfChannels[]>([{ channel_number: null, attribute: '', name: '' }]);

  addChannel() {
    this.searchByChannels.update(channels => [...channels, { channel_number: null, attribute: '', name: '' }]);
  }
 removeChannel(indexToRemove: number) {
    this.searchByChannels.update(currentChannels =>
      currentChannels.filter((_, index) => index !== indexToRemove)
    );
  }
  logData() {
    console.log(this.searchByChannels());
  }
}
