import {
  Component, OnInit, OnDestroy, AfterViewInit,
ChangeDetectorRef, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  trend?: string;
}

interface MonthData {
  month: string;
  enCours: number;
  termines: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('barCanvas')   barCanvas!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  private barChart?:   Chart;
  private donutChart?: Chart;

  searchQuery       = '';
  notificationCount = 0;
  loading           = true;

  statCards: StatCard[] = [
    { title: 'Utilisateurs RH',         value: 0, subtitle: '—', icon: 'rh',        trend: 'up'      },
    { title: 'Encadrants',              value: 0, subtitle: '—', icon: 'encadrant', trend: 'up'      },
    { title: 'Stagiaires',              value: 0, subtitle: '—', icon: 'stagiaire', trend: 'up'      },
    { title: 'Stages en cours',         value: 0, subtitle: '—', icon: 'stage',     trend: 'neutral' },
    { title: 'Stages terminés',         value: 0, subtitle: '—', icon: 'check',     trend: 'up'      },
    { title: 'Candidatures en attente', value: 0, subtitle: '—', icon: 'clock',     trend: 'warning' },
  ];

  monthlyData: MonthData[] = [
    { month: 'Jan',  enCours: 0, termines: 0 },
    { month: 'Fév',  enCours: 0, termines: 0 },
    { month: 'Mar',  enCours: 0, termines: 0 },
    { month: 'Avr',  enCours: 0, termines: 0 },
    { month: 'Mai',  enCours: 0, termines: 0 },
    { month: 'Juin', enCours: 0, termines: 0 },
  ];

  roleStats = {
    rh:         { count: 0, percent: 0, color: '#C2580F' },
    encadrants: { count: 0, percent: 0, color: '#1e2530' },
    stagiaires: { count: 0, percent: 0, color: '#a84a0c' },
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.charger(), 0);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.donutChart?.destroy();
  }

  charger(): void {
    this.loading = true;
    forkJoin({
      utilisateurs: this.adminService.getAllUtilisateurs(),
      stages:       this.adminService.getAllStages(),
      candidatures: this.adminService.getAllCandidatures()
    }).subscribe({
      next: ({ utilisateurs, stages, candidatures }: any) => {

        // ═══ Utilisateurs ═══
        const u               = utilisateurs.filter((x: any) => !this.getRole(x).includes('Admin'));
        const totalRH         = u.filter((x: any) => this.getRole(x) === 'RH').length;
        const totalEncadrants = u.filter((x: any) => this.getRole(x) === 'Encadrant').length;
        const totalStagiaires = u.filter((x: any) => this.getRole(x) === 'Stagiaire').length;

        // ═══ Stages ═══
        const stagesEnCours  = stages.filter((s: any) => s.statusStage === 'EN_COURS').length;
        const stagesTermines = stages.filter((s: any) => s.statusStage === 'TERMINE').length;

        // ═══ Candidatures ═══
        const candEnAttente    = candidatures.filter((c: any) => c.statut === 'EN_ATTENTE').length;
        this.notificationCount = candEnAttente;

        // ═══ Stat cards ═══
        this.statCards[0].value    = totalRH;
        this.statCards[0].subtitle = `${totalRH} compte${totalRH > 1 ? 's' : ''} actif${totalRH > 1 ? 's' : ''}`;
        this.statCards[1].value    = totalEncadrants;
        this.statCards[1].subtitle = `${totalEncadrants} encadrant${totalEncadrants > 1 ? 's' : ''}`;
        this.statCards[2].value    = totalStagiaires;
        this.statCards[2].subtitle = `${totalStagiaires} stagiaire${totalStagiaires > 1 ? 's' : ''}`;
        this.statCards[3].value    = stagesEnCours;
        this.statCards[3].subtitle = stagesEnCours > 0 ? 'En progression' : 'Aucun en cours';
        this.statCards[4].value    = stagesTermines;
        this.statCards[4].subtitle = `${stagesTermines} terminé${stagesTermines > 1 ? 's' : ''}`;
        this.statCards[5].value    = candEnAttente;
        this.statCards[5].subtitle = candEnAttente > 0 ? 'À traiter' : 'Aucune en attente';

        // ═══ Donut roleStats ═══
        const total = totalRH + totalEncadrants + totalStagiaires || 1;
        this.roleStats = {
          rh:         { count: totalRH,         percent: Math.round(totalRH / total * 100),         color: '#C2580F' },
          encadrants: { count: totalEncadrants, percent: Math.round(totalEncadrants / total * 100), color: '#1e2530' },
          stagiaires: { count: totalStagiaires, percent: Math.round(totalStagiaires / total * 100), color: '#a84a0c' },
        };

        // ═══ Bar chart data ═══
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                        'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        this.monthlyData = months.slice(0, 6).map((month, i) => {
          const enCours  = stages.filter((s: any) =>
            s.statusStage === 'EN_COURS' &&
            new Date(s.dateDebut).getMonth() === i
          ).length;
          const termines = stages.filter((s: any) =>
            s.statusStage === 'TERMINE' &&
            new Date(s.dateDebut).getMonth() === i
          ).length;
          return { month, enCours, termines };
        });

        this.loading = false;
        this.cdr.detectChanges();

        // ✅ Créer les charts après rendu DOM
        setTimeout(() => this.creerCharts(), 0);
      },
      error: (err: any) => {
        console.error('Erreur dashboard', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ══ Création / mise à jour des charts ══════════════════════
  private creerCharts(): void {
    this.creerBarChart();
    this.creerDonutChart();
  }

  private creerBarChart(): void {
    if (!this.barCanvas?.nativeElement) return;
    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'En cours',
            data: this.monthlyData.map(d => d.enCours),
            backgroundColor: '#C2580F',
            borderRadius: 5,
            borderSkipped: false
          },
          {
            label: 'Terminés',
            data: this.monthlyData.map(d => d.termines),
            backgroundColor: '#1e2530',
            borderRadius: 5,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e2530',
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12 },
            bodyFont:  { size: 12 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f0f0f0' },
            ticks: { color: '#aaa', font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#aaa', font: { size: 11 } }
          }
        }
      }
    });
  }

  private creerDonutChart(): void {
    if (!this.donutCanvas?.nativeElement) return;
    if (this.donutChart) this.donutChart.destroy();

    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['RH', 'Encadrants', 'Stagiaires'],
        datasets: [{
          data: [
            this.roleStats.rh.count,
            this.roleStats.encadrants.count,
            this.roleStats.stagiaires.count
          ],
          backgroundColor: ['#C2580F', '#1e2530', '#a84a0c'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e2530',
            padding: 10,
            cornerRadius: 8
          }
        }
      }
    });
  }

  // ══ Helpers ════════════════════════════════════════════════
  getRole(u: any): string {
    const auth = u.authorities?.[0]?.authority || u.role || '';
    if (auth.includes('RH'))        return 'RH';
    if (auth.includes('ENCADRANT')) return 'Encadrant';
    if (auth.includes('STAGIAIRE')) return 'Stagiaire';
    if (auth.includes('ADMIN'))     return 'Admin';
    return 'inconnu';
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
}
