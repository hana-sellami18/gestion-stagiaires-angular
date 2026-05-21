import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Register } from './components/register/register';
import { GestionStagesComponent } from './gestion-stages/gestion-stages';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout';
import { ListeUtilisateursComponent } from './admin/liste-utilisateurs/liste-utilisateurs';
import { Parametres } from './admin/parametres/parametres';
import { AdminProfileComponent } from './admin/admin-profile/admin-profile';
import { adminGuard } from './guards/admin.guard';
import { rhGuard }    from './guards/rh.guard';
import { DemandesAccesComponent } from './admin/demandes-acces/demandes-acces';

const routes: Routes = [
{ path: 'login',    component: LoginComponent },
{ path: 'register', component: Register },

// ─── ESPACE RH ───────────────────────────────────────────
{
path: 'gestion-stages',
component: GestionStagesComponent,
canActivate: [rhGuard],
children: [
{ path: 'dashboard',    component: GestionStagesComponent },
{ path: 'offres',       component: GestionStagesComponent },
{ path: 'candidatures', component: GestionStagesComponent },
{ path: 'stagiaires',   component: GestionStagesComponent },
{ path: 'encadrants',   component: GestionStagesComponent },
{ path: 'evaluations',  component: GestionStagesComponent },
{ path: 'archives',     component: GestionStagesComponent },
{ path: 'parametres',   component: GestionStagesComponent },
{ path: 'profil',       component: GestionStagesComponent },
{ path: 'offre-form',   component: GestionStagesComponent },
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }

]
},

// ─── ESPACE ADMIN ─────────────────────────────────────────
{
path: 'admin',
component: AdminLayoutComponent,
canActivate: [adminGuard],
children: [
{ path: 'dashboard',    component: AdminDashboardComponent    },
{ path: 'utilisateurs', component: ListeUtilisateursComponent },
{ path: 'parametres',   component: Parametres                 },
{ path: 'profil',       component: AdminProfileComponent      },
{ path: 'demandes-acces', component: DemandesAccesComponent },
{ path: '', redirectTo: 'utilisateurs', pathMatch: 'full' }  // ✅ redirige vers utilisateurs
]
},

// ─── REDIRECTIONS ─────────────────────────────────────────
{ path: '',   redirectTo: '/login', pathMatch: 'full' },
{ path: '**', redirectTo: '/login' }
];

@NgModule({
imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
