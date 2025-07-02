import { Injectable, inject } from '@angular/core';
// Removed: import { provideResource, resource } from '@angular-resource/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { gdtfFixtures, gdtfMode, gdtfChannels } from '../models/gdtf_db.model';
import { environment } from '../../../enviorments/environment.msi';

interface FixtureSearchParams {
  name?: string;
  manufacturer?: string;
  creator?: string;
  limit?: number;
  offset?: number;
}

interface ChannelSearchCondition {
  channel_number?: number;
  attribute?: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GdtfDataService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() {}

  // Basic fixture search
  searchFixtures(params: FixtureSearchParams): Observable<gdtfFixtures[]> {
    return this.http.get<gdtfFixtures[]>('/api/fixtures', { params: this.toHttpParams(params) });
  }

  // Get fixture by ID with modes
  getFixtureById(id: number): Observable<gdtfFixtures & { modes: gdtfMode[] }> {
    return this.http.get<gdtfFixtures & { modes: gdtfMode[] }>(`/api/fixtures/${id}`);
  }

  // Search by channel configuration
  searchByChannels(conditions: ChannelSearchCondition[]): Observable<gdtfFixtures[]> {
    return this.http.post<gdtfFixtures[]>('/api/fixtures/channels/search', { conditions });
  }

  // Get modes for a fixture
  getFixtureModes(fixtureId: number): Observable<gdtfMode[]> {
    return this.http.get<gdtfMode[]>('/api/modes', { params: new HttpParams().set('fixture_id', fixtureId.toString()) });
  }

  // Get popular fixtures (example of custom endpoint)
  getPopularFixtures(limit: number = 10): Observable<gdtfFixtures[]> {
    return this.http.get<gdtfFixtures[]>('/api/fixtures/popular', {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  // Get fixtures by manufacturer
  getFixturesByManufacturer(manufacturer: string): Observable<gdtfFixtures[]> {
    return this.http.get<gdtfFixtures[]>('/api/fixtures', { params: new HttpParams().set('manufacturer', manufacturer) });
  }

  // Helper to convert object to HttpParams
  private toHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params || {}).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams;
  }
}
