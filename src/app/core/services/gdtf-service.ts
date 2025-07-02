import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { gdtfFixtures, gdtfChannels } from '../models/gdtf_db.model';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../enviorments/environment.msi';

@Injectable({
  providedIn: 'root'
})
export class GdtfDataService {
  private apiUrl = environment.apiUrl + "gdtf"

  constructor(private http: HttpClient) { }

  searchFixtures(filters: {
    name?: string;
    manufacturer?: string;
    creator?: string;
  }): Observable<gdtfFixtures[]> {
    // Implementació real amb HTTP
    /* return this.http.get<gdtfFixtures[]>(`${this.apiUrl}/fixtures`, { params: filters })
       .pipe(
       // delay(1000) // Simula retard de xarxa (opcional)
     );*/

    // Implementació temporal amb dummies (eliminar quan tinguis l'API real)

    return of([
      {
        id: 1,
        rid: 1,
        name:  'Quantum Wash',
        manufacturer: 'Robe',
        creator:  'gdtf_lighting_designer',
        version: '1.2',
        rating: 4.8,
        thumbnail: 'https://www.earpro.es/33543-large_default/robe-megapointe.jpg',
        modes: [
          {
            id: 1,
            fixture_id: 1,
            name: 'Full Mode',
            description: 'Full control mode with all channels',
            dmx_footprint: 37,
            channels: [
              { id: 1, mode_id: 1, channel_number: 1, name: 'Dimmer', attribute: 'DIMMER' },
              { id: 2, mode_id: 1, channel_number: 2, name: 'Pan', attribute: 'PAN' },
              { id: 3, mode_id: 1, channel_number: 3, name: 'Pan Fine', attribute: 'PAN FINE' },
              { id: 4, mode_id: 1, channel_number: 4, name: 'Tilt', attribute: 'TILT' }
            ]
          },
          {
            id: 2,
            fixture_id: 1,
            name: 'Basic Mode',
            description: 'Simplified control mode',
            dmx_footprint: 24,
            channels: [
              { id: 5, mode_id: 2, channel_number: 1, name: 'Dimmer', attribute: 'DIMMER' },
              { id: 6, mode_id: 2, channel_number: 2, name: 'Pan', attribute: 'PAN' },
              { id: 7, mode_id: 2, channel_number: 3, name: 'Tilt', attribute: 'TILT' }
            ]
          }
        ]
      },
      {
        id: 2,
        rid: 2,
        name: 'Sharpy',
        manufacturer:  'Clay Paky',
        creator: 'gdtf_creator',
        version: '2.0',
        rating: 1.5,
        thumbnail: 'https://www.bki.co.id/foto_berita/no_pict.jpg',
        modes: [
          {
            id: 3,
            fixture_id: 2,
            name: 'Extended',
            description: 'Extended control mode',
            dmx_footprint: 20,
            channels: [
              { id: 8, mode_id: 3, channel_number: 1, name: 'Dimmer', attribute: 'DIMMER' },
              { id: 9, mode_id: 3, channel_number: 2, name: 'Pan', attribute: 'PAN' },
              { id: 10, mode_id: 3, channel_number: 3, name: 'Tilt', attribute: 'TILT' }
            ]
          }
        ]
      }
    ]).pipe(delay(800));

  }

  searchByChannels(channels: gdtfChannels[]): Observable<gdtfFixtures[]> {
    const validChannels = channels.filter(c => c.channel_number || c.attribute || c.name);

    /*return this.http.post<gdtfFixtures[]>(`${this.apiUrl}/fixtures/by-channels`, {
      channels: validChannels
    });*/

    // Implementació temporal amb dummies (eliminar quan tinguis l'API real)

    return of([
      {
        id: 3,
        rid: 3,
        name: 'MegaPointe',
        manufacturer: 'Martin',
        creator: 'gdtf_pro',
        version: '1.5',
        rating: 4.7,
        modes: [],
        thumbnail: 'https://www.earpro.es/33543-large_default/robe-megapointe.jpg'
      }
    ]).pipe(delay(1000));

  }

  downloadFixture(id: number): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/fixtures/${id}/download`, {
      responseType: 'blob' as 'json'
    });
  }
}
