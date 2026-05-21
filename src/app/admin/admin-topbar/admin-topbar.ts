import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-topbar.html',
  styleUrls: ['./admin-topbar.css']
})
export class AdminTopbarComponent implements OnInit {
  nomComplet = '';
  email = '';
  initiales = '';
  showDropdown = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.nomComplet = localStorage.getItem('nomComplet') || 'Admin';
    this.email      = localStorage.getItem('email') || '';
    this.initiales  = this.getInitiales(this.nomComplet);
  }

  getInitiales(nom: string): string {
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
