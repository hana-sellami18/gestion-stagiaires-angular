import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false // <-- AJOUTE CETTE LIGNE
})
export class AppComponent {
  title = 'gestion-stagiaires-web';
}
