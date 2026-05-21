import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:8089/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }
soumettreDemande(data: any): Observable<any> {
  return this.http.post('http://localhost:8089/api/demandes-acces', data);
}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token',        response.token          ?? '');
        localStorage.setItem('userId',       String(response.id      ?? ''));
        localStorage.setItem('role',         response.role           ?? '');
        localStorage.setItem('email',        response.email          ?? credentials.email ?? '');
        const tel = (response.telephone !== null && response.telephone !== undefined)
          ? String(response.telephone) : '';
        localStorage.setItem('telephone', tel);
        localStorage.setItem('nomComplet',   response.nomComplet     ?? '');
        const parts  = (response.nomComplet ?? '').trim().split(/\s+/);
        localStorage.setItem('prenom',       parts[0]               ?? '');
        localStorage.setItem('nom',          parts.slice(1).join(' ') ?? '');
        localStorage.setItem('cycle',        response.cycle          ?? '');
        localStorage.setItem('filiere',      response.filiere        ?? '');
        localStorage.setItem('etablissement',response.etablissement  ?? '');
        localStorage.setItem('dateNaissance',response.dateNaissance  ?? response.date_naissance ?? '');
      })
    );
  }

  updateProfil(profil: { nomComplet: string; email: string; telephone: string }): Observable<any> {
    const userId = localStorage.getItem('userId');
    const token  = localStorage.getItem('token') ?? '';
    return this.http.put(
      `${this.baseUrl}/update-profile/${userId}`,
      { nomComplet: profil.nomComplet.trim(), email: profil.email, telephone: profil.telephone },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }) }
    ).pipe(
      tap((response: any) => {
        const nc    = response.nomComplet ?? profil.nomComplet;
        const parts = nc.trim().split(/\s+/);
        localStorage.setItem('nomComplet', nc);
        localStorage.setItem('prenom',     parts[0]               ?? '');
        localStorage.setItem('nom',        parts.slice(1).join(' ') ?? '');
        localStorage.setItem('email',      response.email     ?? profil.email);
        const telUpd = (response.telephone !== null && response.telephone !== undefined)
          ? String(response.telephone) : profil.telephone;
        localStorage.setItem('telephone', telUpd);
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken():   string | null { return localStorage.getItem('token');  }
  getRole():    string | null { return localStorage.getItem('role');   }
  getUserId():  string | null { return localStorage.getItem('userId'); }
  isLoggedIn(): boolean       { return !!localStorage.getItem('token'); }

  isRH(): boolean {
    const role = localStorage.getItem('role') ?? '';
    return role === 'ROLE_RH' || role === 'RH';
  }

  getProfil() {
    const nomComplet = localStorage.getItem('nomComplet') ?? '';
    const parts      = nomComplet.trim().split(/\s+/);
    return {
      nomComplet,
      prenom:        localStorage.getItem('prenom')        || parts[0]                 || '',
      nom:           localStorage.getItem('nom')           || parts.slice(1).join(' ') || '',
      email:         localStorage.getItem('email')         ?? '',
      role:          localStorage.getItem('role')          ?? '',
      telephone:     localStorage.getItem('telephone')     ?? '',
      departement:   '',
      cycle:         localStorage.getItem('cycle')         ?? '',
      filiere:       localStorage.getItem('filiere')       ?? '',
      etablissement: localStorage.getItem('etablissement') ?? '',
    };
  }
}

// ── AUTH GUARD ────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    }
    // Sauvegarder l'URL demandée pour rediriger après login
    localStorage.setItem('redirectUrl', state.url);
    this.router.navigate(['/login']);
    return false;
  }
}
