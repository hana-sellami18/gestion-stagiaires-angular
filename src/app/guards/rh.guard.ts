import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const rhGuard: CanActivateFn = () => {
const router = inject(Router);
const role   = localStorage.getItem('role');
const token  = localStorage.getItem('token');

console.log('RH Guard — role:', role, '| token:', !!token);

  if (token && (role === 'ROLE_RH' || role === 'RH')) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
