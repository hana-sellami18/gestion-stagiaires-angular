import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveView } from '../shared/active-view.type';


@Component({
selector: 'app-sidebar',
standalone: true,
imports: [CommonModule],
templateUrl: './sidebar.html',
styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

@Input() userInitials = 'RH';
@Input() userName     = '';
@Input() userEmail    = '';
@Input() totalOffres  = 0;
@Input() activeView: ActiveView = 'dashboard';
@Input() isOpen       = false;
@Input() isCollapsed  = false;

@Output() close           = new EventEmitter<void>();
@Output() goWelcome       = new EventEmitter<void>();
@Output() goDashboard     = new EventEmitter<void>();
@Output() goList          = new EventEmitter<void>();
@Output() openForm        = new EventEmitter<void>();
@Output() goHome          = new EventEmitter<void>();
@Output() goProfil        = new EventEmitter<void>();
@Output() logout          = new EventEmitter<void>();
@Output() collapsedChange = new EventEmitter<boolean>();
@Output() goCandidatures  = new EventEmitter<void>();
@Output() goStagiaires    = new EventEmitter<void>();
@Output() goEncadrants    = new EventEmitter<void>();
@Output() goEvaluations   = new EventEmitter<void>();
@Output() goArchives      = new EventEmitter<void>();
@Output() goParametres    = new EventEmitter<void>();

toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
