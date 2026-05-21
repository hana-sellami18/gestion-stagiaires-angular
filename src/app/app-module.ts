import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';
import { LoginComponent } from './components/login/login';
import { Register } from './components/register/register';
import { GestionStagesComponent } from './gestion-stages/gestion-stages';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from './admin/admin-topbar/admin-topbar';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout';
import { Parametres } from './admin/parametres/parametres';
import { AdminProfileComponent } from './admin/admin-profile/admin-profile';
import { DemandesAccesComponent } from './admin/demandes-acces/demandes-acces';

@NgModule({
declarations: [
AppComponent,
LoginComponent,
Register
],
imports: [
BrowserModule,
FormsModule,
HttpClientModule,
GestionStagesComponent,
AdminDashboardComponent,
AdminSidebarComponent,
AdminTopbarComponent,
AdminLayoutComponent,
Parametres,
AdminProfileComponent,
AppRoutingModule,
DemandesAccesComponent
],
providers: [
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
],
bootstrap: [AppComponent]
})
export class AppModule { }
