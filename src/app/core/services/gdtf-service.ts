import { Injectable, inject } from '@angular/core';
// Removed: import { provideResource, resource } from '@angular-resource/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface GdtfFixture {
  id: number;
  rid: number;
  name: string;
  manufacturer: string;
  revision?: string;
  creation_date?: number;
  last_modified?: number;
  uploader?: string;
  rating?: number;
  version?: string;
  creator?: string;
  uuid?: string;
  filesize?: number;
  thumbnail?: string;
}

interface GdtfMode {
  id: number;
  name: string;
  description?: string;
  dmx_footprint: number;
  channels?: GdtfChannel[];
}

interface GdtfChannel {
  id: number;
  channel_number: number;
  name: string;
  attribute: string;
}

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
  private http = inject(HttpClient);

  constructor() {}

  // Basic fixture search
  searchFixtures(params: FixtureSearchParams): Observable<GdtfFixture[]> {
    return this.http.get<GdtfFixture[]>('/api/fixtures', { params: this.toHttpParams(params) });
  }

  // Get fixture by ID with modes
  getFixtureById(id: number): Observable<GdtfFixture & { modes: GdtfMode[] }> {
    return this.http.get<GdtfFixture & { modes: GdtfMode[] }>(`/api/fixtures/${id}`);
  }

  // Search by channel configuration
  searchByChannels(conditions: ChannelSearchCondition[]): Observable<GdtfFixture[]> {
    return this.http.post<GdtfFixture[]>('/api/fixtures/channels/search', { conditions });
  }

  // Get modes for a fixture
  getFixtureModes(fixtureId: number): Observable<GdtfMode[]> {
    return this.http.get<GdtfMode[]>('/api/modes', { params: new HttpParams().set('fixture_id', fixtureId.toString()) });
  }

  // Get popular fixtures (example of custom endpoint)
  getPopularFixtures(limit: number = 10): Observable<GdtfFixture[]> {
    return this.http.get<GdtfFixture[]>('/api/fixtures/popular', {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  // Get fixtures by manufacturer
  getFixturesByManufacturer(manufacturer: string): Observable<GdtfFixture[]> {
    return this.http.get<GdtfFixture[]>('/api/fixtures', { params: new HttpParams().set('manufacturer', manufacturer) });
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
