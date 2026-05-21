import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class LoginComponent {
  loginData     = { email: '', password: '' };
  isLoading     = false;
  showPassword  = false;
  emailError    = '';
  passwordError = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef   // ← ajout
  ) {}

  onLogin(): void {
    this.emailError    = '';
    this.passwordError = '';
    let hasError = false;

    if (!this.loginData.email.trim()) {
      this.emailError = "L'email est requis";
      hasError = true;
    } else if (!this.loginData.email.includes('@')) {
      this.emailError = "Email invalide";
      hasError = true;
    }

    if (!this.loginData.password.trim()) {
      this.passwordError = "Le mot de passe est requis";
      hasError = true;
    }

    if (hasError) return;

    this.isLoading = true;
    this.cdr.detectChanges();  // ← affiche le spinner immédiatement

    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        localStorage.setItem('token',      response.token);
        localStorage.setItem('email',      response.email);
        localStorage.setItem('role',       response.role);
        localStorage.setItem('nom',        response.nom        || '');
        localStorage.setItem('prenom',     response.prenom     || '');
        localStorage.setItem('nomComplet', (response.prenom + ' ' + response.nom).trim());
        localStorage.setItem('telephone',  response.telephone  || '');
        localStorage.setItem('userId',     response.id?.toString() || '');

        const role = response.role;

        if (role === 'ROLE_RH' || role === 'RH') {
          const redirectUrl = localStorage.getItem('redirectUrl') || '/gestion-stages/dashboard';
          localStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        } else if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert('Accès refusé : rôle non reconnu.');
          localStorage.clear();
        }

        this.cdr.detectChanges();  // ← après navigation
      },
      error: () => {
        this.isLoading     = false;
        this.passwordError = 'Email ou mot de passe incorrect.';
        this.cdr.detectChanges();  // ← force l'affichage de l'erreur
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
