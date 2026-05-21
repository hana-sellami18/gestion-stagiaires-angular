import {
  Component, Input, Output, EventEmitter,
  OnInit, ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { AuthService } from '../services/auth';
export interface UserProfil {
  nomComplet: string;
  email:      string;
  role:       string;
  telephone?: string;
}

@Component({
  selector:      'app-profil',
  standalone:    true,
  imports:       [CommonModule, FormsModule],
  templateUrl:   './profil.html',
  styleUrls:     ['./profil.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProfilComponent implements OnInit {

  @Input() profil: UserProfil = { nomComplet: '', email: '', role: '', telephone: '' };

  @Input() totalOffres       = 0;
  @Input() candidaturesCount = 0;
  @Input() stagiairesCount   = 0;

  @Output() openSidebar = new EventEmitter<void>();
  @Output() retour      = new EventEmitter<void>();
  @Output() profilSaved = new EventEmitter<UserProfil>();

  editMode      = false;
  isSaving      = false;
  saveError     = '';
  avatarPreview: string | null = null;
  editData: UserProfil = { ...this.profil };

  // ★ AuthService injecté — pas besoin d'un ProfilService séparé
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.profil = {
      nomComplet: this.profil.nomComplet || localStorage.getItem('nomComplet') || '',
      email:      this.profil.email      || localStorage.getItem('email')      || '',
      role:       this.profil.role       || localStorage.getItem('role')       || '',
      telephone:  this.profil.telephone  || localStorage.getItem('telephone')  || '',
    };
    this.editData = { ...this.profil };
  }

  get initiales(): string {
    const parts = (this.profil.nomComplet || '').trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = e => { this.avatarPreview = e.target?.result as string; };
      reader.readAsDataURL(input.files[0]);
    }
  }

  toggleEdit(): void {
    this.editData  = { ...this.profil };
    this.saveError = '';
    this.editMode  = true;
  }

  cancelEdit(): void {
    this.editMode  = false;
    this.saveError = '';
    this.editData  = { ...this.profil };
  }

  saveEdit(): void {
    if (this.isSaving) return;
    this.isSaving  = true;
    this.saveError = '';

    // ★ Appel HTTP via AuthService → met à jour la BD
    this.authService.updateProfil({
      nomComplet: this.editData.nomComplet,
      email:      this.editData.email,
      telephone:  this.editData.telephone ?? ''
    }).subscribe({
      next: (response) => {
        // Mise à jour de l'affichage
        this.profil = {
          nomComplet: response.nomComplet ?? this.editData.nomComplet,
          email:      response.email      ?? this.editData.email,
          role:       this.profil.role,                        // le rôle n'est pas modifiable
          telephone:  response.telephone  ?? this.editData.telephone,
        };
        this.editMode = false;
        this.isSaving = false;
        this.profilSaved.emit(this.profil);
      },
      error: (err) => {
        this.isSaving  = false;
        this.saveError = err?.error?.message
          ?? 'Erreur lors de la sauvegarde. Vérifiez votre connexion.';
        console.error('[ProfilComponent] updateProfil error:', err);
      }
    });
  }
}
