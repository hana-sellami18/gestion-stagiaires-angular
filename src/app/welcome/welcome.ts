import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffreStage } from '../shared/offre-stage.model';
export interface ActivityItem {
  type:  'new' | 'open' | 'candidature' | 'closed';
  color: 'orange' | 'green' | 'blue' | 'red';
  text:  string;
  time:  string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  @Input() userName          = 'Utilisateur';
  @Input() totalOffres       = 0;
  @Input() disponiblesCount  = 0;
  @Input() candidaturesCount = 0;
  @Input() offres: OffreStage[] = [];
  @Input() sidebarCollapsed  = false;   // ✅ NOUVEAU

  @Output() openSidebar = new EventEmitter<void>();
  @Output() goDashboard = new EventEmitter<void>();
  @Output() goList      = new EventEmitter<void>();
  @Output() openForm    = new EventEmitter<void>();

  currentTime = '';
  today       = '';
  private timer: any;

  get greetingMessage(): string {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return 'Bonjour';
    if (h >= 12 && h < 18) return 'Bon après-midi';
    if (h >= 18 && h < 22) return 'Bonsoir';
    return 'Bonne nuit';
  }

  get recentActivity(): ActivityItem[] {
    if (!this.offres || this.offres.length === 0) return [];
    const items: ActivityItem[] = [];
    const withDate = this.offres.filter(o => o.datePublication != null);
    const recent = [...withDate]
      .sort((a, b) => new Date(b.datePublication!).getTime() - new Date(a.datePublication!).getTime())
      .slice(0, 3);

    recent.forEach(o => {
      items.push(o.estDisponible
        ? { type: 'open',   color: 'green', text: `Offre "${o.titre}" est ouverte`, time: this.timeAgo(o.datePublication) }
        : { type: 'closed', color: 'red',   text: `Offre "${o.titre}" est fermée`,  time: this.timeAgo(o.datePublication) }
      );
    });

    if (this.candidaturesCount > 0) {
      items.unshift({ type: 'candidature', color: 'blue', text: `${this.candidaturesCount} candidature(s) en cours`, time: "Aujourd'hui" });
    }

    return items.slice(0, 4);
  }

  ngOnInit(): void {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.today = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  private timeAgo(date: any): string {
    if (!date) return 'Date inconnue';
    const diff  = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)   return 'À l\'instant';
    if (mins  < 60)  return `Il y a ${mins} min`;
    if (hours < 24)  return `Il y a ${hours}h`;
    if (days  === 1) return 'Hier';
    return `Il y a ${days} jours`;
  }
}
