import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
selector: 'app-admin-profile',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './admin-profile.html',
styleUrls: ['./admin-profile.css']
})
export class AdminProfileComponent implements OnInit {

successMessage = '';
errorMessage = '';

profile = {
nom: localStorage.getItem('nom') || 'Administrateur',
    prenom: localStorage.getItem('prenom') || 'ASM',
    email: localStorage.getItem('email') || 'admin@asm.com',
    telephone: localStorage.getItem('telephone') || '',
  };

  editProfile = { ...this.profile };

  passwordForm = {
    nouveau: '',
    confirmer: ''
  };

  showNouveau   = false;
  showConfirmer = false;

  ngOnInit(): void {
    this.editProfile = { ...this.profile };
  }

  getInitiales(): string {
    return ((this.profile.prenom?.[0] || '') + (this.profile.nom?.[0] || '')).toUpperCase();
  }

  saveProfile(): void {
    this.profile = { ...this.editProfile };
    this.successMessage = 'Profil mis à jour avec succès.';
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  savePassword(): void {
    this.errorMessage = '';
    if (!this.passwordForm.nouveau || !this.passwordForm.confirmer) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.passwordForm.nouveau !== this.passwordForm.confirmer) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.passwordForm.nouveau.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    this.passwordForm = { nouveau: '', confirmer: '' };
    this.successMessage = 'Mot de passe modifié avec succès.';
    setTimeout(() => this.successMessage = '', 3000);
  }
}
