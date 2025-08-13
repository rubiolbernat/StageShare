import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { gdtfFixtures, gdtfChannels } from '../models/gdtf_db.model';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs'; // Import 'of' for error handling

@Injectable({
  providedIn: 'root'
})
export class GdtfDataService {
  private apiUrl = environment.apiUrl + "/gdtf/gdtf_api.php";

  constructor(private http: HttpClient) { }

  searchFixtures(filters: {
    name?: string;
    manufacturer?: string;
    creator?: string;
  }): Observable<gdtfFixtures[]> {

    // Netejem els filtres per no enviar paràmetres buits
    let params = new HttpParams();
    if (filters.name) {
      params = params.set('name', filters.name);
    }
    if (filters.manufacturer) {
      params = params.set('manufacturer', filters.manufacturer);
    }
    if (filters.creator) {
      params = params.set('creator', filters.creator);
    }

    const url = `${this.apiUrl}?action=getFixtures`;

    // --- LOG DE LA PETICIÓ ---
    console.log(`[Angular Service] Sending GET request to: ${url} with params:`, filters);

    return this.http.get<gdtfFixtures[]>(url, { params: params })
      .pipe(
        // --- LOG DE LA RESPOSTA ---
        tap(response => {
          console.log('[Angular Service] Received response for searchFixtures:', response);
          if (response.length === 0) {
            console.warn('[Angular Service] The search returned 0 results.');
          }
        }),
        // --- GESTIÓ D'ERRORS ---
        catchError(error => {
          console.error('[Angular Service] Error in searchFixtures HTTP call:', error);
          return of([]); // Retorna un array buit en cas d'error per no trencar l'aplicació
        })
      );
  }

  searchByChannels(channels: gdtfChannels[]): Observable<gdtfFixtures[]> {
    const validChannels = channels.filter(c => c.channel_number || c.attribute || c.name);
    const url = `${this.apiUrl}?action=getFixturesByChannels`;
    const payload = { channels: validChannels };

    // --- LOG DE LA PETICIÓ ---
    console.log(`[Angular Service] Sending POST request to: ${url} with payload:`, payload);

    return this.http.post<gdtfFixtures[]>(url, payload)
      .pipe(
        // --- LOG DE LA RESPOSTA ---
        tap(response => {
          console.log('[Angular Service] Received response for searchByChannels:', response);
          if (response.length === 0) {
            console.warn('[Angular Service] The channel search returned 0 results.');
          }
        }),
        // --- GESTIÓ D'ERRORS ---
        catchError(error => {
          console.error('[Angular Service] Error in searchByChannels HTTP call:', error);
          return of([]);
        })
      );
  }

  downloadFixture(rid: number): Observable<Blob> {
    const url = `${this.apiUrl}?action=getFixtureDownload&rid=${rid}`;

    // --- LOG DE LA PETICIÓ ---
    console.log(`[Angular Service] Requesting download from: ${url}`);

    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        tap(() => console.log('[Angular Service] Blob received for download.')),
        catchError(error => {
          console.error('[Angular Service] Error in downloadFixture HTTP call:', error);
          throw error; // Rellancem l'error perquè el component el pugui gestionar
        })
      );
  }
}
