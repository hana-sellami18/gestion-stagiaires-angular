import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
// Supprime la ligne "type ActiveView = ..."
import { ActiveView } from '../shared/active-view.type';
import { OffreStage } from '../shared/offre-stage.model';
import { SidebarComponent } from '../sidebar/sidebar';
import {
DashboardComponent,
Candidature,
CandidatEntretien,
EncadrantStat,
EvaluationMoyenne
} from '../dashboard/dashboard';
import { OffresListComponent } from '../offres-list/offres-list';
import { OffreFormComponent } from '../offre-form/offre-form';
import { ProfilComponent, UserProfil } from '../profil/profil';
import { StageService } from '../services/stage';
import { CandidaturesComponent } from '../candidatures/candidatures';
import { CandidatureService } from '../services/candidature';
import { StagiairesComponent } from '../stagiaires/stagiaires';
import { EncadrantsComponent } from '../encadrants/encadrants';
import { EvaluationsComponent } from '../evaluations/evaluations';


@Component({
selector: 'app-gestion-stages',
standalone: true,
imports: [
CommonModule,
SidebarComponent,
DashboardComponent,
OffresListComponent,
OffreFormComponent,
ProfilComponent,
CandidaturesComponent,
StagiairesComponent,
EncadrantsComponent,
EvaluationsComponent
],
templateUrl: './gestion-stages.html',
styleUrls: ['./gestion-stages.css']
})
export class GestionStagesComponent implements OnInit {

sidebarOpen      = false;
sidebarCollapsed = false;
avatarMenuOpen   = false;
notifMenuOpen    = false;
activeView: ActiveView = 'dashboard';
selectedStage: OffreStage | null = null;

// ── KPI de base ──────────────────────────────────────────
candidaturesCount       = 0;
candidaturesEnAttente   = 0;
candidaturesAcceptees   = 0;
candidaturesRefusees    = 0;
candidaturesEnEntretien = 0;
totalStagiaires         = 0;
totalEncadrants         = 0;

// ── Alertes ──────────────────────────────────────────────
entretiensPlanifies = 0;
stagesTerminent     = 0;

// ── Données chart candidatures par mois ──────────────────
candidaturesParMois: number[] = new Array(12).fill(0);

// ── Score IA moyen par mois ───────────────────────────────
scoreIAParMois: number[] = new Array(12).fill(0);

// ── Répartition filières / cycles ────────────────────────
repartitionFilieres: { nom: string; count: number; pct: number }[] = [];
repartitionCycles:   { nom: string; count: number; pct: number }[] = [];

// ── Pipeline entretiens ───────────────────────────────────
candidatsEnEntretien: CandidatEntretien[] = [];

// ── Encadrants actifs ─────────────────────────────────────
topEncadrants: EncadrantStat[] = [];

// ── Évaluations moyennes ──────────────────────────────────
evaluationsMoyennes: EvaluationMoyenne[] = [];

// ── Évolution stages / offres ─────────────────────────────
stagesActifsParMois:   number[] = new Array(12).fill(0);
offresOuvertesParMois: number[] = new Array(12).fill(0);

// ── Offres ───────────────────────────────────────────────
offres: OffreStage[] = [];
totalOffres      = 0;
disponiblesCount = 0;

// ── Profil utilisateur ────────────────────────────────────
userProfil: UserProfil = {
nomComplet: localStorage.getItem('nomComplet') || '',
    email:      localStorage.getItem('email')      || '',
    role:       localStorage.getItem('role')       || '',
    telephone:  localStorage.getItem('telephone')  || ''
  };

  private base = 'http://localhost:8089/api';

  constructor(
    private router: Router,
    private stageService: StageService,
    private candidatureService: CandidatureService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.syncViewFromUrl();
    setTimeout(() => {
      this.chargerMesOffres();
      this.chargerCandidatures();
      this.chargerStats();
      this.chargerEncadrants();
      this.chargerEvaluations();
    }, 0);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.syncViewFromUrl());
  }

  // ── Sync URL → view ───────────────────────────────────────
  private syncViewFromUrl(): void {
    const urlSegment = this.router.url.split('/').pop() || 'dashboard';
    const urlToView: Record<string, ActiveView> = {
      dashboard:    'dashboard',
      offres:       'list',
      candidatures: 'candidatures',
      stagiaires:   'stagiaires',
      encadrants:   'encadrants',
      evaluations:  'evaluations',
      archives:     'archives',
      parametres:   'parametres',
      profil:       'profil',
      'offre-form': 'form'
    };
    this.activeView = urlToView[urlSegment] ?? 'dashboard';
    setTimeout(() => this.cdr.detectChanges());
  }

  private getNomChamp(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.nom) return val.nom;
    return '';
  }

  // ── Chargement stats admin (stagiaires + encadrants) ──────
  chargerStats(): void {
    this.http.get<any>(`${this.base}/admin/stats`).subscribe({
      next: (data) => {
        this.totalStagiaires = data.totalStagiaires ?? 0;
        this.totalEncadrants = data.totalEncadrants ?? 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Chargement encadrants pour le ranking ─────────────────
  chargerEncadrants(): void {
    this.http.get<any[]>(`${this.base}/encadrants`).subscribe({
      next: (data) => {
        // On compte le nb de stagiaires par encadrant
        const map: Record<string, number> = {};
        data.forEach(e => {
          const nom = e.nomComplet || `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Inconnu';
          map[nom] = (e.nbStagiaires ?? e.stagiaires?.length ?? 0);
        });
        this.topEncadrants = Object.entries(map)
          .map(([nom, count]) => ({ nom, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Chargement évaluations moyennes ───────────────────────
  chargerEvaluations(): void {
    this.http.get<any[]>(`${this.base}/evaluations`).subscribe({
      next: (data) => {
        if (!data.length) {
          // Valeurs fictives si aucune donnée encore
          this.evaluationsMoyennes = [
            { critere: 'Compétences', note: 0 },
            { critere: 'Ponctualité', note: 0 },
            { critere: 'Autonomie',   note: 0 },
            { critere: 'Implication', note: 0 },
          ];
          this.cdr.detectChanges();
          return;
        }
        const sum: Record<string, { total: number; count: number }> = {};
        data.forEach(ev => {
          const criteres: Record<string, number> = {
            'Compétences': ev.noteCompetences ?? ev.competences ?? 0,
            'Ponctualité': ev.notePonctualite ?? ev.ponctualite ?? 0,
            'Autonomie':   ev.noteAutonomie   ?? ev.autonomie   ?? 0,
            'Implication': ev.noteImplication  ?? ev.implication ?? 0,
          };
          Object.entries(criteres).forEach(([k, v]) => {
            if (!sum[k]) sum[k] = { total: 0, count: 0 };
            sum[k].total += v;
            sum[k].count += 1;
          });
        });
        this.evaluationsMoyennes = Object.entries(sum).map(([critere, { total, count }]) => ({
          critere,
          note: Math.round((total / count) * 10) / 10
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.evaluationsMoyennes = [
          { critere: 'Compétences', note: 0 },
          { critere: 'Ponctualité', note: 0 },
          { critere: 'Autonomie',   note: 0 },
          { critere: 'Implication', note: 0 },
        ];
      }
    });
  }

  // ── Chargement candidatures ───────────────────────────────
  chargerCandidatures(): void {
    this.candidatureService.getAll().subscribe({
      next: (data: any[]) => {
        this.candidaturesCount       = data.length;
        this.candidaturesEnAttente   = data.filter(c => c.statut === 'EN_ATTENTE').length;
        this.candidaturesAcceptees   = data.filter(c => c.statut === 'ACCEPTE' || c.statut === 'ACCEPTEE').length;
        this.candidaturesRefusees    = data.filter(c => c.statut === 'REFUSEE').length;
        this.candidaturesEnEntretien = data.filter(c => c.statut === 'EN_ENTRETIEN').length;

        // ── Candidatures par mois ──────────────────────────
        const parMois = new Array(12).fill(0);
        data.forEach(c => {
          if (c.dateDepot) {
            const m = new Date(c.dateDepot).getMonth();
            parMois[m]++;
          }
        });
        this.candidaturesParMois = parMois;

        // ── Score IA moyen par mois ────────────────────────
        const scoreSum   = new Array(12).fill(0);
        const scoreCount = new Array(12).fill(0);
        data.forEach(c => {
          if (c.dateDepot && c.scoreIA != null) {
            const m = new Date(c.dateDepot).getMonth();
            scoreSum[m]   += c.scoreIA;
            scoreCount[m] += 1;
          }
        });
        this.scoreIAParMois = scoreSum.map((s, i) =>
          scoreCount[i] > 0 ? Math.round(s / scoreCount[i]) : 0
        );

        // ── Pipeline entretiens ────────────────────────────
        this.candidatsEnEntretien = data
          .filter(c => c.statut === 'EN_ENTRETIEN')
          .slice(0, 6)
          .map(c => ({
            nom: c.stagiaire?.nomComplet
              || `${c.stagiaire?.prenom || ''} ${c.stagiaire?.nom || ''}`.trim()
              || '—',
            sujet:         c.sujet?.titre        || '—',
            dateEntretien: c.dateEntretien        || c.dateDepot || new Date(),
            scoreIA:       c.scoreIA              ?? 0
          }));

        // ── Alertes ────────────────────────────────────────
        const now = new Date();
        const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        this.entretiensPlanifies = data.filter(c => {
          if (c.statut !== 'EN_ENTRETIEN' || !c.dateEntretien) return false;
          const d = new Date(c.dateEntretien);
          return d >= now && d <= in7;
        }).length;

        // ── Répartition filières ───────────────────────────
        const filMap: Record<string, number> = {};
        data.forEach(c => {
          const f = c.stagiaire?.filiere?.nom
            || this.getNomChamp(c.sujet?.filiereCible)
            || 'Autre';
          filMap[f] = (filMap[f] || 0) + 1;
        });
        this.repartitionFilieres = Object.entries(filMap)
          .map(([nom, count]) => ({
            nom, count,
            pct: data.length > 0 ? Math.round((count / data.length) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count);

        // ── Répartition cycles ─────────────────────────────
        const cycMap: Record<string, number> = {};
        data.forEach(c => {
          const cy = c.stagiaire?.cycle?.nom
            || this.getNomChamp(c.sujet?.cycleCible)
            || 'Autre';
          cycMap[cy] = (cycMap[cy] || 0) + 1;
        });
        this.repartitionCycles = Object.entries(cycMap)
          .map(([nom, count]) => ({
            nom, count,
            pct: data.length > 0 ? Math.round((count / data.length) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count);

        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Chargement offres ─────────────────────────────────────
chargerMesOffres(): void {
    this.stageService.getMesOffres().subscribe({
      next: (data: any[]) => {
        this.offres = data.map((o: any) => ({
          id:              o.id,
          titre:           o.titre,
          description:     o.description,

          // ✅ Couvre : string, objet {id,nom}, filiereNom, filiere.nom
          filiereCible:    o.filiereNom
                        ?? (typeof o.filiereCible === 'string' ? o.filiereCible : null)
                        ?? o.filiereCible?.nom
                        ?? o.filiere?.nom
                        ?? '',

          cycleCible:      o.cycleNom
                        ?? (typeof o.cycleCible === 'string' ? o.cycleCible : null)
                        ?? o.cycleCible?.nom
                        ?? o.cycle?.nom
                        ?? '',

          competences:     o.competencesCibles ?? o.competences ?? [],
          statut:          o.estDisponible ? 'Ouvert' : 'Fermé',
          datePublication: o.datePublication ? new Date(o.datePublication) : undefined,
          estDisponible:   o.estDisponible ?? false
        }));

        this.totalOffres      = this.offres.length;
        this.disponiblesCount = this.offres.filter(o => o.estDisponible).length;

        const ouvertesParMois = new Array(12).fill(0);
        data.forEach(o => {
          if (o.datePublication) {
            const m = new Date(o.datePublication).getMonth();
            ouvertesParMois[m]++;
          }
        });
        this.offresOuvertesParMois = ouvertesParMois;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erreur chargement offres', err)
    });
  }

  // ── Chargement stages actifs ──────────────────────────────
  chargerStagesActifs(): void {
    this.http.get<any[]>(`${this.base}/stages`).subscribe({
      next: (data) => {
        const parMois = new Array(12).fill(0);
        const in30    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        let terminent = 0;
        data.forEach(s => {
          if (s.dateDebut) {
            const m = new Date(s.dateDebut).getMonth();
            parMois[m]++;
          }
          if (s.dateFin) {
            const fin = new Date(s.dateFin);
            if (fin <= in30 && fin >= new Date()) terminent++;
          }
        });
        this.stagesActifsParMois = parMois;
        this.stagesTerminent     = terminent;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Getters user ──────────────────────────────────────────
  get userName(): string    { return localStorage.getItem('nomComplet') || 'Admin RH'; }
  get userEmail(): string   { return localStorage.getItem('email')      || ''; }
  get firstName(): string   { return this.userName.trim().split(' ')[0] || 'RH'; }
  get userInitials(): string {
    const parts = this.userName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : this.userName.slice(0, 2).toUpperCase();
  }

  // ── Navigation ────────────────────────────────────────────
  goToWelcome()      { this.navigate('welcome'); }
  goToDashboard()    { this.navigate('dashboard'); }
  goToList()         { this.navigate('list'); }
  goToProfil()       { this.navigate('profil'); }
  goToCandidatures() { this.navigate('candidatures'); }
  goToStagiaires()   { this.navigate('stagiaires'); }
  goToEncadrants()   { this.navigate('encadrants'); }
  goToEvaluations()  { this.navigate('evaluations'); }
  goToArchives()     { this.navigate('archives'); }
  goToParametres()   { this.navigate('parametres'); }

  ouvrirFormulaire(stage: OffreStage | null = null) { this.navigate('form', stage); }
  voirDetail(stage: OffreStage) { this.navigate('detail', stage); }
  retourListe()   { this.navigate('list'); }
  retourAccueil() { this.navigate('dashboard'); }

  deconnecter(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onProfilSaved(profil: UserProfil): void {
    this.userProfil = profil;
    localStorage.setItem('nomComplet', profil.nomComplet);
    localStorage.setItem('email',      profil.email);
    localStorage.setItem('telephone',  profil.telephone ?? '');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.gtb-avatar-wrap')) this.avatarMenuOpen = false;
    if (!target.closest('.gtb-notif-wrap'))  this.notifMenuOpen  = false;
  }

  private navigate(view: ActiveView, stage: OffreStage | null = null): void {
    this.sidebarOpen   = false;
    this.activeView    = view;
    this.selectedStage = stage;

    const urlMap: Partial<Record<ActiveView, string>> = {
      dashboard:    '/gestion-stages/dashboard',
      list:         '/gestion-stages/offres',
      candidatures: '/gestion-stages/candidatures',
      stagiaires:   '/gestion-stages/stagiaires',
      encadrants:   '/gestion-stages/encadrants',
      evaluations:  '/gestion-stages/evaluations',
      archives:     '/gestion-stages/archives',
      parametres:   '/gestion-stages/parametres',
      profil:       '/gestion-stages/profil',
      form:         '/gestion-stages/offre-form'
    };
    const url = urlMap[view];
    if (url) this.router.navigate([url]);
  }

  supprimerOffre(id: number | undefined): void {
    if (id === undefined) return;
    this.stageService.supprimerOffre(id).subscribe({
      next: () => {
        this.offres           = this.offres.filter(o => o.id !== id);
        this.totalOffres      = this.offres.length;
        this.disponiblesCount = this.offres.filter(o => o.estDisponible).length;
        this.navigate('list');
      },
      error: (err: any) => console.error('Erreur suppression', err)
    });
  }

onSauvegarder(offre: OffreStage): void {
    const payload = {
      titre:             offre.titre,
      description:       offre.description,
      filiereId:         offre.filiereId,        // ✅ ID direct
      cycleId:           offre.cycleId,           // ✅ ID direct
      competencesCibles: offre.competences,
      estDisponible:     offre.estDisponible
    };

    if (!offre.id) {
      this.stageService.publierOffre(payload).subscribe({
        next: () => { this.chargerMesOffres(); this.navigate('list'); },
        error: (err: any) => console.error(err)
      });
    } else {
      this.stageService.modifierOffre(offre.id, payload).subscribe({
        next: () => { this.chargerMesOffres(); this.navigate('list'); },
        error: (err: any) => console.error(err)
      });
    }
  }
}
