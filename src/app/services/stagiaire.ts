import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Encadrant {
id: number;
nom: string;
prenom: string;
email: string;
departement?: string;
specialite?: string;
}

export interface Stagiaire {
id: number;
utilisateur?: {
id: number;
nom: string;
prenom: string;
email: string;
telephone?: string;
etablissement?: string;
filiere?: { id: number; nom: string };
cycle?: { id: number; nom: string };
};
sujet?: {
id: number;
titre: string;
filiereCible?: { id: number; nom: string } | string;  // ✅ objet ou string
cycleCible?: { id: number; nom: string } | string;    // ✅ objet ou string
};
candidature?: { id: number };
encadrant?: {
id: number;
nom: string;
prenom: string;
email: string;
};
dateDebut: string;
dateFin?: string;
statusStage: 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
}

@Injectable({ providedIn: 'root' })
export class StagiaireService {

private baseUrl = 'http://localhost:8089/api/stages';

constructor(private http: HttpClient) {}

  getAll(): Observable<Stagiaire[]> {
    return this.http.get<Stagiaire[]>(this.baseUrl);
  }

  terminer(id: number): Observable<Stagiaire> {
    return this.http.put<Stagiaire>(`${this.baseUrl}/${id}/terminer`, {});
  }

  getEncadrants(): Observable<Encadrant[]> {
    return this.http.get<Encadrant[]>(`${this.baseUrl}/encadrants`);
  }

  affecterEncadrant(stagiaireId: number, encadrantId: number): Observable<Stagiaire> {
    return this.http.put<Stagiaire>(
      `${this.baseUrl}/${stagiaireId}/affecter-encadrant?encadrantId=${encadrantId}`,
      {}
    );
  }
}
