import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OffreStage } from '../shared/offre-stage.model';

@Component({
selector: 'app-offre-form',
standalone: true,
imports: [CommonModule, FormsModule, ReactiveFormsModule],
templateUrl: './offre-form.html',
styleUrls: ['./offre-form.css']
})
export class OffreFormComponent implements OnInit, OnChanges {

@Input() offre: OffreStage | null = null;
@Output() sauvegarder = new EventEmitter<OffreStage>();
@Output() annuler     = new EventEmitter<void>();
@Output() openSidebar = new EventEmitter<void>();

form!: FormGroup;
editMode = false;

filieres: { id: number, nom: string }[] = [];
cycles:   { id: number, nom: string }[] = [];
statutOptions: OffreStage['statut'][] = ['Ouvert', 'Fermé', 'En attente'];

newSkill    = '';
competences: string[] = [];

private submitted = false;

constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['offre']) {
      this.editMode    = !!this.offre;
      this.competences = this.offre ? [...this.offre.competences] : [];
      this.submitted   = false;
      this.initForm();
    }
  }

  ngOnInit(): void {
    if (!this.form) {
      this.editMode    = !!this.offre;
      this.competences = this.offre ? [...this.offre.competences] : [];
      this.submitted   = false;
      this.initForm();
    }

    // /api/references est public — pas besoin de token
    this.http.get<{ id: number, nom: string }[]>(
      'http://localhost:8089/api/references/filieres'
    ).subscribe({
      next: data => {
        this.filieres = data;
        if (this.offre?.filiereId) {
          this.form.patchValue({ filiereId: this.offre.filiereId });
        } else if (data.length > 0) {
          this.form.patchValue({ filiereId: data[0].id });
        }
      },
      error: err => console.error('Erreur filieres:', err)
    });

    this.http.get<{ id: number, nom: string }[]>(
      'http://localhost:8089/api/references/cycles'
    ).subscribe({
      next: data => {
        this.cycles = data;
        if (this.offre?.cycleId) {
          this.form.patchValue({ cycleId: this.offre.cycleId });
        } else if (data.length > 0) {
          this.form.patchValue({ cycleId: data[0].id });
        }
      },
      error: err => console.error('Erreur cycles:', err)
    });
  }

  get formCompetences(): string[] { return this.competences; }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && c.touched);
  }

  addSkill(): void {
    const trimmed = this.newSkill.trim();
    if (trimmed && !this.competences.includes(trimmed)) {
      this.competences.push(trimmed);
      this.newSkill = '';
    }
  }

  removeSkill(skill: string): void {
    this.competences = this.competences.filter(s => s !== skill);
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitted) return;
    this.submitted = true;

    const offreData: OffreStage = {
      id:              this.offre?.id,
      ...this.form.value,
      competences:     [...this.competences],
      datePublication: this.offre?.datePublication ?? new Date()
    };

    this.sauvegarder.emit(offreData);
  }

  onAnnuler(): void { this.annuler.emit(); }

  private initForm(): void {
    this.form = this.fb.group({
      titre:         [this.offre?.titre         || '', Validators.required],
      filiereId:     [this.offre?.filiereId     || null, Validators.required],
      cycleId:       [this.offre?.cycleId       || null, Validators.required],
      statut:        [this.offre?.statut        || 'Ouvert', Validators.required],
      description:   [this.offre?.description   || '', Validators.required],
      estDisponible: [this.offre?.estDisponible ?? true]
    });
  }
}
