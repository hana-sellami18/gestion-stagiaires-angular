import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
selector: 'app-liste-utilisateurs',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './liste-utilisateurs.html',
styleUrls: ['./liste-utilisateurs.css']
})
export class ListeUtilisateursComponent implements OnInit {

utilisateurs: any[] = [];
loading = true;
searchTable = '';
filtreRole = 'Tous les rôles';
showDropdown = false;
showModal = false;

rolesOptions = ['Tous les rôles', 'RH', 'Encadrant', 'Stagiaire'];

newUser = {
nom: '', prenom: '', email: '',
telephone: '', role: 'RH',
departement: '', specialite: ''
};

// ✅ Référence au wrapper du dropdown
@ViewChild('dropdownRef') dropdownRef!: ElementRef;

// ✅ Corrigé : on passe $event et on vérifie si le clic vient de l'intérieur du dropdown
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
    if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  get totalUsers()      { return this.utilisateurs.length; }
  get totalRH()         { return this.utilisateurs.filter((u: any) => this.getRole(u) === 'RH').length; }
  get totalEncadrants() { return this.utilisateurs.filter((u: any) => this.getRole(u) === 'Encadrant').length; }
  get totalStagiaires() { return this.utilisateurs.filter((u: any) => this.getRole(u) === 'Stagiaire').length; }

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit déclenché !');
    setTimeout(() => { this.charger(); }, 0);
  }

  charger(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.adminService.getAllUtilisateurs().subscribe({
      next: (data: any[]) => {
        this.utilisateurs = data.filter((u: any) => this.getRole(u) !== 'Admin');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRole(u: any): string {
    const auth = u.authorities?.[0]?.authority || u.role || '';
    if (auth.includes('RH'))        return 'RH';
    if (auth.includes('ENCADRANT')) return 'Encadrant';
    if (auth.includes('STAGIAIRE')) return 'Stagiaire';
    if (auth.includes('ADMIN'))     return 'Admin';
    return 'inconnu';
  }

  getStatut(u: any): string {
    return u.actif !== false ? 'Actif' : 'Inactif';
  }

  getInitiales(u: any): string {
    const n = (u.nom?.[0] || '').toUpperCase();
    const p = (u.prenom?.[0] || '').toUpperCase();
    return n + p || '?';
  }

  get utilisateursFiltres(): any[] {
    return this.utilisateurs.filter((u: any) => {
      const matchRole = this.filtreRole === 'Tous les rôles' ||
                        this.getRole(u) === this.filtreRole;
      const search = this.searchTable.toLowerCase();
      const matchSearch = !search ||
        u.nom?.toLowerCase().includes(search) ||
        u.prenom?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search);
      return matchRole && matchSearch;
    });
  }

  // ✅ Plus besoin de stopPropagation ici
  selectRole(role: string): void {
    this.filtreRole = role;
    this.showDropdown = false;
  }

  openModal(): void {
    this.newUser = {
      nom: '', prenom: '', email: '',
      telephone: '', role: 'RH',
      departement: '', specialite: ''
    };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  creerCompte(): void {
    if (!this.newUser.nom || !this.newUser.prenom || !this.newUser.email) return;
    const obs = this.newUser.role === 'RH'
      ? this.adminService.creerRH(this.newUser)
      : this.adminService.creerEncadrant(this.newUser);
    obs.subscribe({
      next: () => { this.closeModal(); this.charger(); },
      error: (err: any) => console.error('Erreur création', err)
    });
  }

  toggleStatut(u: any): void {
    const actif = u.actif !== false;
    const obs = actif
      ? this.adminService.desactiverCompte(u.id)
      : this.adminService.activerCompte(u.id);
    obs.subscribe({
      next: () => this.charger(),
      error: (err: any) => console.error('Erreur toggle statut', err)
    });
  }

  supprimer(id: number): void {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.adminService.supprimerUtilisateur(id).subscribe({
      next: () => this.charger(),
      error: (err: any) => console.error('Erreur suppression', err)
    });
  }
}
