import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

constructor(private router: Router) {}

  // Routes publiques — pas besoin de token
private publicRoutes = [
  '/api/auth/',
  '/api/cv/',
  '/api/references/publiques/',  // uniquement les routes vraiment publiques
  '/api/demandes-acces/',
  '/uploads/'
];
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    const isPublic = this.publicRoutes.some(route => req.url.includes(route));

    const authReq = (token && !isPublic)
      ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.clear();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
