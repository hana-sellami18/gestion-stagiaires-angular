import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StageService {
  private apiUrl = 'http://localhost:8089/api/sujets';

  constructor(private http: HttpClient) {}

  // ✅ Pas de rhId dans l'URL — le backend l'extrait du token JWT
  publierOffre(offre: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/publier`, offre);
  }

  // ✅ Pas de rhId dans l'URL — le backend filtre automatiquement
  getMesOffres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mes-offres`);
  }

  getToutesLesOffres(cycle?: string): Observable<any[]> {
    let url = this.apiUrl;
    if (cycle) url += `?cycle=${cycle}`;
    return this.http.get<any[]>(url);
  }

  modifierOffre(id: number, offre: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, offre);
  }

  supprimerOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOffreById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
