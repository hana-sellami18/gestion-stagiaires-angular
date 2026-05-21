import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { StagiaireService, Encadrant, Stagiaire } from '../services/stagiaire';

@Component({
selector: 'app-encadrants',
standalone: true,
imports: [CommonModule, FormsModule],  // ✅ FormsModule ajouté
templateUrl: './encadrants.html',
styleUrls: ['./encadrants.css']
})
export class EncadrantsComponent implements OnInit {

encadrants: Encadrant[] = [];
stagiaires: Stagiaire[] = [];
loading = true;
selectedEncadrant: Encadrant | null = null;

// ✅ Recherche
searchQuery = '';

constructor(
    private stagiaireService: StagiaireService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    forkJoin({
      encadrants: this.stagiaireService.getEncadrants(),
      stagiaires: this.stagiaireService.getAll()
    }).subscribe({
      next: ({ encadrants, stagiaires }) => {
        this.encadrants = encadrants;
        this.stagiaires = stagiaires;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Encadrants filtrés par recherche
  get encadrantsFiltres(): Encadrant[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.encadrants;
    return this.encadrants.filter(e =>
      this.getNomComplet(e).toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.specialite || '').toLowerCase().includes(q) ||
      (e.departement || '').toLowerCase().includes(q)
    );
  }

  ouvrirModal(e: Encadrant): void {
    if (this.getStagiairesOfEncadrant(e.id).length === 0) return;
    this.selectedEncadrant = e;
    document.body.style.overflow = 'hidden';
  }

  fermerModal(): void {
    this.selectedEncadrant = null;
    document.body.style.overflow = '';
  }

  getNomComplet(enc: Encadrant): string {
    return `${enc.prenom} ${enc.nom}`;
  }

  getNomStagiaire(s: Stagiaire): string {
    if (!s.utilisateur) return '—';
    return `${s.utilisateur.prenom} ${s.utilisateur.nom}`;
  }

  getStagiairesOfEncadrant(encadrantId: number): Stagiaire[] {
    return this.stagiaires.filter(s => s.encadrant?.id === encadrantId);
  }

  get encadrantsAvecAffectation(): number {
    return this.encadrants.filter(e =>
      this.getStagiairesOfEncadrant(e.id).length > 0
    ).length;
  }

  getInitials(nom: string): string {
    if (!nom) return '?';
    return nom.trim().split(' ').filter(Boolean)
      .map(n => n[0]?.toUpperCase()).slice(0, 2).join('');
  }

  getAvatarColor(nom: string): string {
    const colors = ['#4f46e5', '#7c3aed', '#db2777', '#059669', '#0284c7', '#d97706'];
    if (!nom) return colors[0];
    return colors[nom.charCodeAt(0) % colors.length];
  }

  trackByEncadrant(index: number, e: Encadrant): number { return e.id; }
  trackByStagiaire(index: number, s: Stagiaire): number { return s.id; }
}
