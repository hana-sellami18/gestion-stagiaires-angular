import {
  Component, Input, Output, EventEmitter,
OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges,
ViewChild, ElementRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OffreStage } from '../shared/offre-stage.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface Candidature {
  nom: string;
  sujet?: string;
  filiere?: string;
  statut: 'EN_ATTENTE' | 'ACCEPTO' | 'ACCEPTEE' | 'REFUSEE' | 'EN_ENTRETIEN';
  date?: Date | string;
}

export interface CandidatEntretien {
  nom: string;
  sujet: string;
  dateEntretien: Date | string;
  scoreIA: number;
}

export interface EncadrantStat {
  nom: string;
  count: number;
}

export interface EvaluationMoyenne {
  critere: string;
  note: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() offres: OffreStage[]    = [];
  @Input() totalOffres             = 0;
  @Input() disponiblesCount        = 0;
  @Input() candidaturesCount       = 0;
  @Input() candidaturesEnAttente   = 0;
  @Input() candidaturesAcceptees   = 0;
  @Input() candidaturesRefusees    = 0;
  @Input() candidaturesEnEntretien = 0;
  @Input() totalStagiaires         = 0;
  @Input() totalEncadrants         = 0;
  @Input() firstName               = 'RH';

  @Input() entretiensPlanifies = 0;
  @Input() stagesTerminent     = 0;

  @Input() candidaturesParMois: number[] = new Array(12).fill(0);
  @Input() scoreIAParMois: number[]      = new Array(12).fill(0);
  @Input() repartitionFilieres: { nom: string; count: number; pct: number }[] = [];
  @Input() repartitionCycles:   { nom: string; count: number; pct: number }[] = [];
  @Input() candidatsEnEntretien: CandidatEntretien[] = [];
  @Input() topEncadrants: EncadrantStat[] = [];
  @Input() evaluationsMoyennes: EvaluationMoyenne[] = [
    { critere: 'Compétences', note: 0 },
    { critere: 'Ponctualité', note: 0 },
    { critere: 'Autonomie',   note: 0 },
    { critere: 'Implication', note: 0 },
  ];
  @Input() stagesActifsParMois: number[]   = new Array(12).fill(0);
  @Input() offresOuvertesParMois: number[] = new Array(12).fill(0);

  @Output() goList         = new EventEmitter<void>();
  @Output() goCandidatures = new EventEmitter<void>();

  @ViewChild('barCandidatures') barCandidaturesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutStatuts') doughnutStatutsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineScoreIA')     lineScoreIARef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutFilieres')doughnutFilieresRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCycles')  doughnutCyclesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineStages')      lineStagesRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private viewReady = false;  // ✅ flag pour savoir si la vue est prête

  today = '';
  private timer: any;

  readonly moisLabels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  readonly filiereColors = ['#D4650A','#374151','#9CA3AF','#F59E0B','#2563EB','#16A34A'];
  readonly cycleColors   = ['#D4650A','#2563EB','#16A34A','#F59E0B'];

  ngOnInit(): void {
    this.updateDate();
    this.timer = setInterval(() => this.updateDate(), 60000);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    // ✅ Délai suffisant pour que le DOM soit stable
    setTimeout(() => this.rebuildCharts(), 200);
  }

  // ✅ Reconstruit les graphes à chaque changement de données
  ngOnChanges(changes: SimpleChanges): void {
    if (this.viewReady) {
      setTimeout(() => this.rebuildCharts(), 50);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.destroyCharts();
  }

  // ✅ Détruit et reconstruit tous les graphes
  private rebuildCharts(): void {
    this.destroyCharts();
    this.buildAllCharts();
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private buildAllCharts(): void {
    this.buildBarCandidatures();
    this.buildDoughnutStatuts();
    this.buildLineScoreIA();
    this.buildDoughnutFilieres();
    this.buildDoughnutCycles();
    this.buildLineStages();
  }

  private buildBarCandidatures(): void {
    if (!this.barCandidaturesRef?.nativeElement) return;
    const chart = new Chart(this.barCandidaturesRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.moisLabels,
        datasets: [{
          label: 'Candidatures',
          data: this.candidaturesParMois,
          backgroundColor: this.candidaturesParMois.map((_, i) =>
            i === new Date().getMonth() ? '#D4650A' : '#FDEBD0'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.parsed.y} candidature(s)` }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }, color: '#94A3B8' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }, color: '#94A3B8', stepSize: 2 }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildDoughnutStatuts(): void {
    if (!this.doughnutStatutsRef?.nativeElement) return;
    const total = this.candidaturesCount || 1;
    const chart = new Chart(this.doughnutStatutsRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Acceptées', 'Refusées', 'En entretien'],
        datasets: [{
          data: [
            this.candidaturesEnAttente,
            this.candidaturesAcceptees,
            this.candidaturesRefusees,
            this.candidaturesEnEntretien
          ],
          backgroundColor: ['#F59E0B','#16A34A','#DC2626','#3B82F6'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} (${Math.round(ctx.parsed / total * 100)}%)`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildLineScoreIA(): void {
    if (!this.lineScoreIARef?.nativeElement) return;
    const chart = new Chart(this.lineScoreIARef.nativeElement, {
      type: 'line',
      data: {
        labels: this.moisLabels,
        datasets: [
          {
            label: 'Score IA moyen',
            data: this.scoreIAParMois,
            borderColor: '#D4650A',
            backgroundColor: 'rgba(212,101,10,.08)',
            fill: true, tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#D4650A',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2,
          },
          {
            label: 'Seuil minimal',
            data: new Array(12).fill(60),
            borderColor: '#94A3B8',
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }, color: '#94A3B8' }
          },
          y: {
            min: 40, max: 100,
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }, color: '#94A3B8',
              callback: v => v + '%'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildDoughnutFilieres(): void {
    if (!this.doughnutFilieresRef?.nativeElement || !this.repartitionFilieres.length) return;
    const chart = new Chart(this.doughnutFilieresRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.repartitionFilieres.map(f => f.nom),
        datasets: [{
          data: this.repartitionFilieres.map(f => f.count),
          backgroundColor: this.filiereColors.slice(0, this.repartitionFilieres.length),
          borderWidth: 0, hoverOffset: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} (${this.repartitionFilieres[ctx.dataIndex]?.pct}%)`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildDoughnutCycles(): void {
    if (!this.doughnutCyclesRef?.nativeElement || !this.repartitionCycles.length) return;
    const chart = new Chart(this.doughnutCyclesRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.repartitionCycles.map(c => c.nom),
        datasets: [{
          data: this.repartitionCycles.map(c => c.count),
          backgroundColor: this.cycleColors.slice(0, this.repartitionCycles.length),
          borderWidth: 0, hoverOffset: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} (${this.repartitionCycles[ctx.dataIndex]?.pct}%)`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildLineStages(): void {
    if (!this.lineStagesRef?.nativeElement) return;
    const chart = new Chart(this.lineStagesRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.moisLabels,
        datasets: [
          {
            label: 'Stages actifs',
            data: this.stagesActifsParMois,
            borderColor: '#D4650A',
            backgroundColor: 'rgba(212,101,10,.07)',
            fill: true, tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#D4650A',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2,
          },
          {
            label: 'Offres ouvertes',
            data: this.offresOuvertesParMois,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37,99,235,.06)',
            fill: true, tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#2563EB',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }, color: '#94A3B8' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { font: { family: "'Plus Jakarta Sans',sans-serif", size: 11 }, color: '#94A3B8', stepSize: 2 }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // ─── Computed ─────────────────────────────────────────────
  get tauxAcceptation(): number {
    return this.candidaturesCount > 0
      ? Math.round(this.candidaturesAcceptees / this.candidaturesCount * 100) : 0;
  }

  get tauxRefus(): number {
    return this.candidaturesCount > 0
      ? Math.round(this.candidaturesRefusees / this.candidaturesCount * 100) : 0;
  }

  get ratioCandSujet(): string {
    return this.totalOffres > 0
      ? (this.candidaturesCount / this.totalOffres).toFixed(1) : '0';
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return 'Bonjour';
    if (h >= 12 && h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  private updateDate(): void {
    this.today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  getInitials(nom: string): string {
    if (!nom) return '?';
    return nom.split(' ').map(n => n[0]?.toUpperCase()).slice(0, 2).join('');
  }

  getAvatarColor(nom: string): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#dc2626','#d97706','#059669','#0284c7','#0891b2'];
    if (!nom) return colors[0];
    return colors[nom.charCodeAt(0) % colors.length];
  }

  getScoreClass(score: number): string {
    if (score >= 75) return 'high';
    if (score >= 55) return 'mid';
    return 'low';
  }

  getEvalColor(note: number): string {
    if (note >= 4)   return '#16A34A';
    if (note >= 2.5) return '#D97706';
    return '#DC2626';
  }
}
