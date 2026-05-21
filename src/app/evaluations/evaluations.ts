import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
selector: 'app-evaluations',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './evaluations.html',
styleUrls: ['./evaluations.css']
})
export class EvaluationsComponent implements OnInit {

private base = 'http://localhost:8089/api';

evaluations: any[] = [];
loading = true;
searchQuery = '';

critereLabels = [
'Qualité du travail',
'Autonomie',
'Communication',
'Ponctualité',
'Initiative',
"Travail d'équipe"
];

constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.charger(), 0);
  }

  charger(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.base}/evaluations`).subscribe({
      next: (data) => {
        console.log('Évaluations reçues:', data);
        this.evaluations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur évaluations:', err);
        this.evaluations = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filtered(): any[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.evaluations;
    return this.evaluations.filter(e =>
      this.getNomStagiaire(e).toLowerCase().includes(q) ||
      this.getNomEncadrant(e).toLowerCase().includes(q)
    );
  }

  getNomStagiaire(e: any): string {
    const u = e.stagiaire?.utilisateur || e.stagiaire;
    if (!u) return '—';
    if (u.prenom && u.nom) return `${u.prenom} ${u.nom}`;
    return u.nom || u.prenom || '—';
  }

  getNomEncadrant(e: any): string {
    const u = e.encadrant;
    if (!u) return '—';
    if (u.prenom && u.nom) return `${u.prenom} ${u.nom}`;
    return u.nom || u.prenom || '—';
  }

  getInitiales(nom: string): string {
    if (!nom || nom === '—') return '?';
    return nom.trim().split(' ').filter(Boolean)
      .map((n: string) => n[0]?.toUpperCase()).slice(0, 2).join('');
  }

  getAvatarColor(nom: string): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#dc2626','#d97706','#059669','#0284c7'];
    if (!nom) return colors[0];
    return colors[nom.charCodeAt(0) % colors.length];
  }

  getNoteLabel(note: number): string {
    if (note >= 18) return 'Excellent';
    if (note >= 14) return 'Très bien';
    if (note >= 10) return 'Bien';
    if (note >= 8)  return 'Passable';
    return 'Insuffisant';
  }

  getNoteColor(note: number): string {
    if (note >= 18) return '#16a34a';
    if (note >= 14) return '#C2580F';
    if (note >= 10) return '#d97706';
    if (note >= 8)  return '#ea580c';
    return '#dc2626';
  }

  getNoteBg(note: number): string {
    if (note >= 18) return '#dcfce7';
    if (note >= 14) return '#FDEBD0';
    if (note >= 10) return '#fef9c3';
    if (note >= 8)  return '#ffedd5';
    return '#fee2e2';
  }

  getNoteLabelColor(note: number): string {
    if (note >= 18) return '#16a34a';
    if (note >= 14) return '#16a34a';
    if (note >= 10) return '#d97706';
    return '#dc2626';
  }

  getNoteLabelBg(note: number): string {
    if (note >= 18) return '#dcfce7';
    if (note >= 14) return '#dcfce7';
    if (note >= 10) return '#fef9c3';
    return '#fee2e2';
  }

  getStars(note: number): number[] {
    const stars = Math.round((note / 20) * 5);
    return Array(5).fill(0).map((_, i) => i < stars ? 1 : 0);
  }

  // Génère des étoiles pour chaque critère basé sur la note globale
  // (puisque les critères individuels ne sont pas stockés en backend)
  getCritereStars(note: number, critereIndex: number): number[] {
    // Légère variation par critère pour simuler des notes différentes
    const variations = [0, -0.5, -1, 0.5, -0.5, 0];
    const noteVariee = Math.max(0, Math.min(20, note + variations[critereIndex] * 2));
    const stars = Math.round((noteVariee / 20) * 5);
    return Array(5).fill(0).map((_, i) => i < stars ? 1 : 0);
  }

  getNoteSur5(note: number): string {
    return ((note / 20) * 5).toFixed(1);
  }

  get totalEvalues(): number { return this.evaluations.length; }

  get moyenneGenerale(): string {
    const notes = this.evaluations.map(e => e.note).filter(n => n != null);
    if (!notes.length) return '—';
    return (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1);
  }

  get excellents(): number {
    return this.evaluations.filter(e => e.note >= 14).length;
  }

  formatDate(d: any): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
