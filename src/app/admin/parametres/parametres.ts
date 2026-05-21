import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Filiere {
  id: number;
  nom: string;
  code?: string;
  description?: string;
}

interface Cycle {
  id: number;
  nom: string;
  duree?: string;
  description?: string;
}

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css'],
  encapsulation: ViewEncapsulation.None
})
export class Parametres implements OnInit {

  private base = 'http://localhost:8089/api/references';

  activeTab: 'filieres' | 'cycles' = 'filieres';

  showModalFiliere = false;
  editingFiliere: Filiere | null = null;
  newFiliere = { nom: '', code: '', description: '' };

  showModalCycle = false;
  editingCycle: Cycle | null = null;
  newCycle = { nom: '', duree: '', description: '' };

  filieres: Filiere[] = [];
  cycles: Cycle[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.chargerFilieres();
      this.chargerCycles();
    }, 0);
  }

  // ═══ FILIÈRES ═══

  chargerFilieres(): void {
    this.http.get<Filiere[]>(`${this.base}/filieres`).subscribe({
      next: (data) => { this.filieres = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erreur filieres', err)
    });
  }

  openAddFiliere(): void {
    this.editingFiliere = null;
    this.newFiliere = { nom: '', code: '', description: '' };
    this.showModalFiliere = true;
  }

  openEditFiliere(f: Filiere): void {
    this.editingFiliere = f;
    this.newFiliere = { nom: f.nom, code: f.code || '', description: f.description || '' };
    this.showModalFiliere = true;
  }

  saveFiliere(): void {
    if (!this.newFiliere.nom) return;
    if (this.editingFiliere) {
      this.http.put(`${this.base}/filieres/${this.editingFiliere.id}`, this.newFiliere).subscribe({
        next: () => { this.showModalFiliere = false; this.chargerFilieres(); },
        error: (err) => console.error('Erreur modification filiere', err)
      });
    } else {
      this.http.post(`${this.base}/filieres`, this.newFiliere).subscribe({
        next: () => { this.showModalFiliere = false; this.chargerFilieres(); },
        error: (err) => console.error('Erreur ajout filiere', err)
      });
    }
  }

  deleteFiliere(id: number): void {
    if (!confirm('Supprimer cette filière ?')) return;
    this.http.delete(`${this.base}/filieres/${id}`).subscribe({
      next: () => this.chargerFilieres(),
      error: (err) => console.error('Erreur suppression filiere', err)
    });
  }

  // ═══ CYCLES ═══

  chargerCycles(): void {
    this.http.get<Cycle[]>(`${this.base}/cycles`).subscribe({
      next: (data) => { this.cycles = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erreur cycles', err)
    });
  }

  openAddCycle(): void {
    this.editingCycle = null;
    this.newCycle = { nom: '', duree: '', description: '' };
    this.showModalCycle = true;
  }

  openEditCycle(c: Cycle): void {
    this.editingCycle = c;
    this.newCycle = { nom: c.nom, duree: c.duree || '', description: c.description || '' };
    this.showModalCycle = true;
  }

  saveCycle(): void {
    if (!this.newCycle.nom) return;
    if (this.editingCycle) {
      this.http.put(`${this.base}/cycles/${this.editingCycle.id}`, this.newCycle).subscribe({
        next: () => { this.showModalCycle = false; this.chargerCycles(); },
        error: (err) => console.error('Erreur modification cycle', err)
      });
    } else {
      this.http.post(`${this.base}/cycles`, this.newCycle).subscribe({
        next: () => { this.showModalCycle = false; this.chargerCycles(); },
        error: (err) => console.error('Erreur ajout cycle', err)
      });
    }
  }

  deleteCycle(id: number): void {
    if (!confirm('Supprimer ce cycle ?')) return;
    this.http.delete(`${this.base}/cycles/${id}`).subscribe({
      next: () => this.chargerCycles(),
      error: (err) => console.error('Erreur suppression cycle', err)
    });
  }
}
