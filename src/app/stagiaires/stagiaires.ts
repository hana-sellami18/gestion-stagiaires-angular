import { Component, OnInit, HostListener, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StagiaireService, Stagiaire, Encadrant } from '../services/stagiaire';

@Component({
selector: 'app-stagiaires',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './stagiaires.html',
styleUrls: ['./stagiaires.css'],
encapsulation: ViewEncapsulation.None
})
export class StagiairesComponent implements OnInit {

stagiaires: Stagiaire[] = [];
loading = true;
selectedStagiaire: Stagiaire | null = null;
terminatingId: number | null = null;

encadrants: Encadrant[] = [];
selectedEncadrantId: number | null = null;
affectationLoading = false;
encadrantDropdownOpen = false;

searchQuery = '';
viewMode: 'cards' | 'table' = 'cards';

constructor(
    private stagiaireService: StagiaireService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.charger();
    this.chargerEncadrants();
  }

  charger(): void {
    this.loading = true;
    this.stagiaireService.getAll().subscribe({
      next: (data) => {
        this.stagiaires = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement stagiaires', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerEncadrants(): void {
    this.stagiaireService.getEncadrants().subscribe({
      next: (data) => { this.encadrants = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erreur chargement encadrants', err)
    });
  }

  // ── Filtrage ──
  get stagiairesFiltres(): Stagiaire[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.stagiaires;
    return this.stagiaires.filter(s =>
      this.getNomStagiaire(s).toLowerCase().includes(q) ||
      (s.utilisateur?.email || '').toLowerCase().includes(q) ||
      (s.sujet?.titre || '').toLowerCase().includes(q) ||
      this.getNomEncadrant(s).toLowerCase().includes(q)
    );
  }

  // ── Vue ──
  setView(mode: 'cards' | 'table'): void { this.viewMode = mode; }
  isCardsView(): boolean { return this.viewMode === 'cards'; }
  isTableView(): boolean { return this.viewMode === 'table'; }

  // ── Helpers ──
  getNomChamp(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.nom) return val.nom;
    return '';
  }

  getNomStagiaire(s: Stagiaire): string {
    if (!s.utilisateur) return '—';
    return `${s.utilisateur.prenom} ${s.utilisateur.nom}`;
  }

  getNomEncadrant(s: Stagiaire): string {
    if (!s.encadrant) return 'Non affecté';
    return `${s.encadrant.prenom} ${s.encadrant.nom}`;
  }

  getNomEncadrantObj(e: Encadrant): string {
    return `${e.prenom} ${e.nom}`;
  }

  get enCours(): number { return this.stagiaires.filter(s => s.statusStage === 'EN_COURS').length; }
  get termines(): number { return this.stagiaires.filter(s => s.statusStage === 'TERMINE').length; }

  // ── Modal ──
  voirDetail(s: Stagiaire): void {
    this.selectedStagiaire = s;
    this.selectedEncadrantId = s.encadrant?.id || null;
    this.encadrantDropdownOpen = false;
    document.body.style.overflow = 'hidden';
  }

  fermerDetail(): void {
    this.selectedStagiaire = null;
    this.selectedEncadrantId = null;
    this.encadrantDropdownOpen = false;
    document.body.style.overflow = '';
  }

  // ── Encadrant ──
  affecterEncadrant(): void {
    if (!this.selectedStagiaire || !this.selectedEncadrantId) return;
    this.affectationLoading = true;
    this.stagiaireService.affecterEncadrant(
      this.selectedStagiaire.id,
      this.selectedEncadrantId
    ).subscribe({
      next: (updated) => {
        this.stagiaires = this.stagiaires.map(x => x.id === updated.id ? updated : x);
        this.selectedStagiaire = updated;
        this.selectedEncadrantId = updated.encadrant?.id || this.selectedEncadrantId;
        this.affectationLoading = false;
        this.encadrantDropdownOpen = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur affectation encadrant', err);
        this.affectationLoading = false;
      }
    });
  }

  // ── Terminer ──
  terminer(s: Stagiaire): void {
    if (!s?.id || this.terminatingId === s.id) return;
    if (!confirm(`Terminer le stage de ${this.getNomStagiaire(s)} ?`)) return;
    this.terminatingId = s.id;
    this.stagiaireService.terminer(s.id).subscribe({
      next: (updated) => {
        this.stagiaires = this.stagiaires.map(x => x.id === updated.id ? updated : x);
        if (this.selectedStagiaire?.id === updated.id) this.selectedStagiaire = updated;
        this.terminatingId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur fin de stage', err);
        this.terminatingId = null;
      }
    });
  }

  trackByStagiaireId(index: number, s: Stagiaire): number { return s.id; }

  // ── Avatar ──
  getInitials(nom: string | null | undefined): string {
    if (!nom) return '?';
    return nom.trim().split(' ').filter(Boolean)
      .map(n => n[0]?.toUpperCase()).slice(0, 2).join('');
  }

  getAvatarColor(nom: string | null | undefined): string {
    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#0891b2', '#0d9488', '#059669'];
    if (!nom) return colors[0];
    return colors[nom.charCodeAt(0) % colors.length];
  }

  // ── Dates ──
  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    const parts = d.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return '—';
    const [year, month, day] = parts;
    return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  getDuree(dateDebut: string | null | undefined): string {
    const diff = this.getDaysSince(dateDebut);
    if (diff === null) return '—';
    if (diff <= 0) return "Aujourd'hui";
    if (diff === 1) return '1 jour';
    if (diff < 30) return `${diff} jours`;
    if (diff < 60) return '1 mois';
    return `${Math.floor(diff / 30)} mois`;
  }

  getProgressWidth(s: Stagiaire): string {
    if (s.statusStage === 'TERMINE') return '100%';
    const diff = this.getDaysSince(s.dateDebut);
    if (diff === null || diff <= 0) return '5%';
    return `${Math.min(100, Math.max(5, Math.round((diff / 90) * 100)))}%`;
  }

  getProgressLabel(s: Stagiaire): string {
    if (s.statusStage === 'TERMINE') return 'Terminé';
    const diff = this.getDaysSince(s.dateDebut);
    if (diff === null || diff <= 0) return 'Démarrage';
    if (diff < 30) return 'Début';
    if (diff < 60) return 'En progression';
    return 'Phase avancée';
  }

  // ── Dropdown encadrant ──
  get selectedEncadrant(): Encadrant | null {
    if (!this.selectedEncadrantId) return null;
    return this.encadrants.find(e => e.id === this.selectedEncadrantId) || null;
  }

  get selectedEncadrantName(): string {
    if (!this.selectedEncadrant) return 'Choisir un encadrant';
    return this.getNomEncadrantObj(this.selectedEncadrant);
  }

  toggleEncadrantDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.encadrantDropdownOpen = !this.encadrantDropdownOpen;
  }

  choisirEncadrant(encadrant: Encadrant, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedEncadrantId = encadrant.id;
    this.encadrantDropdownOpen = false;
  }

  isEncadrantSelected(encadrantId: number): boolean {
    return this.selectedEncadrantId === encadrantId;
  }

  @HostListener('document:click')
  closeDropdown(): void { this.encadrantDropdownOpen = false; }

  private getDaysSince(dateString: string | null | undefined): number | null {
    if (!dateString) return null;
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [year, month, day] = parts;
    const debut = new Date(year, month - 1, day);
    debut.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - debut.getTime()) / 86400000);
  }
}
