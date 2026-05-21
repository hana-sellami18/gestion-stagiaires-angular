import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stagiaire {
id?: number;
nomComplet?: string;
nom?: string;
prenom?: string;
email?: string;
filiere?: string;
cycle?: string;
}

export interface SujetStage {
id?: number;
titre?: string;
filiereCible?: string;
cycleCible?: string;
}

export interface AnalyseIA {
id?: number;
scoreGlobal?: number;
scoreCompetences?: number;
scoreFormation?: number;
scoreExperience?: number;
recommendation?: string;
recommendationLabel?: string;
justification?: string;
competencesMatchees?: string[];
competencesManquantes?: string[];
dateAnalyse?: string;
}

export interface Candidature {
id:                    number;
stagiaire?:            Stagiaire;
encadrant?:            Stagiaire;
sujet?:                SujetStage;
statut:                'EN_ATTENTE' | 'ACCEPTE' | 'REFUSEE' | 'EN_ENTRETIEN' | 'VALIDEE_ENCADRANT' | 'REFUSEE_ENCADRANT';
dateDepot?:            string | Date;
dateEntretien?:        string | Date;
cvPath?:               string;
scoreMatchingIA?:      number;
competencesExtraites?: string[];
commentaireEncadrant?: string;
analyseIA?:            AnalyseIA;
}

@Injectable({ providedIn: 'root' })
export class CandidatureService {

private readonly base = 'http://localhost:8089/api/candidatures';

constructor(private http: HttpClient) {}

  getAll(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.base);
  }

  getById(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.base}/${id}`);
  }

  accepter(id: number): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.base}/${id}/accepter`, {});
  }

  refuser(id: number): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.base}/${id}/refuser`, {});
  }

  getEncadrants(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8089/api/candidatures/encadrants`);
  }

  planifierEntretien(id: number, dateEntretien: string, encadrantId: number): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.base}/${id}/entretien`, {
      dateEntretien,
      encadrantId: encadrantId.toString()
    });
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
