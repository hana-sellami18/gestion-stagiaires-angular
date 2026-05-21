import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {

private base = 'http://localhost:8089/api/admin';

constructor(private http: HttpClient) {}

  // ═══ UTILISATEURS ═══
  getAllUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/utilisateurs`);
  }

  supprimerUtilisateur(id: number): Observable<any> {
    return this.http.delete(`${this.base}/utilisateurs/${id}`);
  }

  activerCompte(id: number): Observable<any> {
    return this.http.put(`${this.base}/utilisateurs/${id}/activer`, {});
  }

  desactiverCompte(id: number): Observable<any> {
    return this.http.put(`${this.base}/utilisateurs/${id}/desactiver`, {});
  }

  modifierUtilisateur(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/utilisateurs/${id}`, data);
  }

  // ═══ CRÉATION ═══
  creerRH(data: any): Observable<any> {
    return this.http.post(`${this.base}/creer-rh`, data);
  }

  creerEncadrant(data: any): Observable<any> {
    return this.http.post(`${this.base}/creer-encadrant`, data);
  }

  // ═══ DEMANDES D'ACCÈS ═══
  getDemandesEnAttente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/demandes-acces`);
  }

  getToutesDemandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/demandes-acces/toutes`);
  }

  validerDemande(id: number): Observable<any> {
    return this.http.put(`${this.base}/demandes-acces/${id}/valider`, {});
  }

  refuserDemande(id: number): Observable<any> {
    return this.http.put(`${this.base}/demandes-acces/${id}/refuser`, {});
  }
// ═══ STATS STAGES ═══
getAllStages(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8089/api/stages');
}

getAllCandidatures(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8089/api/candidatures');
}
}
