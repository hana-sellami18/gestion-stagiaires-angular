import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
selector: 'app-register',
templateUrl: './register.html',
styleUrls: ['./register.css'],
standalone: false
})
export class Register {

regData = {
nom:           '',
prenom:        '',
email:         '',
telephone:     '',
dateNaissance: '',
password:      '',
};

isLoading    = false;
showPassword = false;
errors       = { nom: '', prenom: '', email: '', password: '' };

constructor(private router: Router, private authService: AuthService) {}

  onRegister(): void {
    this.errors = { nom: '', prenom: '', email: '', password: '' };
    let hasError = false;

    if (!this.regData.nom.trim()) {
      this.errors.nom = 'Le nom est requis';
      hasError = true;
    }
    if (!this.regData.prenom.trim()) {
      this.errors.prenom = 'Le prénom est requis';
      hasError = true;
    }
    if (!this.regData.email.trim()) {
      this.errors.email = "L'email est requis";
      hasError = true;
    } else if (!this.regData.email.includes('@')) {
      this.errors.email = 'Email invalide';
      hasError = true;
    }
    if (!this.regData.password.trim()) {
      this.errors.password = 'Le mot de passe est requis';
      hasError = true;
    } else if (this.regData.password.length < 6) {
      this.errors.password = 'Minimum 6 caractères';
      hasError = true;
    }

    if (hasError) return;

    this.isLoading = true;

    const demandeData = {
      nom:          this.regData.nom,
      prenom:       this.regData.prenom,
      email:        this.regData.email,
      telephone:    this.regData.telephone,
      password:     this.regData.password,
      roleSouhaite: 'RH'
    };

    this.authService.soumettreDemande(demandeData).subscribe({
      next: () => {
        this.isLoading = false;
        alert("Votre demande a été soumise. Vous recevrez un email après validation par l'administrateur.");
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errors.email = err?.error?.message || "Erreur lors de la soumission.";
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
