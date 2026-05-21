import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
const router = inject(Router);
const role   = localStorage.getItem('role');
const token  = localStorage.getItem('token');

console.log('Admin Guard — role:', role, '| token:', !!token);

  if (token && (role === 'ROLE_ADMIN' || role === 'ADMIN')) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
