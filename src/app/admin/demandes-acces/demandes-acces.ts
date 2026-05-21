import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface DemandeAcces {
id: number;
nom: string;
prenom: string;
email: string;
telephone?: string;
roleSouhaite: string;
departement?: string;
specialite?: string;
statut: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
dateDemande?: string;
}

@Component({
selector: 'app-demandes-acces',
standalone: true,
imports: [CommonModule],
templateUrl: './demandes-acces.html',
styleUrls: ['./demandes-acces.css']
})
export class DemandesAccesComponent implements OnInit {

demandes: DemandeAcces[] = [];
loading = true;
filterStatut: 'TOUTES' | 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE' = 'TOUTES';
actionLoading: number | null = null;

private base = 'http://localhost:8089/api/admin';

constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.http.get<DemandeAcces[]>(`${this.base}/demandes-acces/toutes`).subscribe({
      next: (data) => {
        this.demandes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filtered(): DemandeAcces[] {
    if (this.filterStatut === 'TOUTES') return this.demandes;
    return this.demandes.filter(d => d.statut === this.filterStatut);
  }

  get totalEnAttente(): number {
    return this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  get totalValidees(): number {
    return this.demandes.filter(d => d.statut === 'VALIDEE').length;
  }

  get totalRefusees(): number {
    return this.demandes.filter(d => d.statut === 'REFUSEE').length;
  }

  valider(id: number): void {
    this.actionLoading = id;
    this.http.put(`${this.base}/demandes-acces/${id}/valider`, {}).subscribe({
      next: () => {
        this.demandes = this.demandes.map(d =>
          d.id === id ? { ...d, statut: 'VALIDEE' } : d
        );
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading = null;
        this.cdr.detectChanges();
      }
    });
  }

  refuser(id: number): void {
    this.actionLoading = id;
    this.http.put(`${this.base}/demandes-acces/${id}/refuser`, {}).subscribe({
      next: () => {
        this.demandes = this.demandes.map(d =>
          d.id === id ? { ...d, statut: 'REFUSEE' } : d
        );
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading = null;
        this.cdr.detectChanges();
      }
    });
  }

  getInitials(nom: string, prenom: string): string {
    return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
  }

  formatDate(d: any): string {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}
