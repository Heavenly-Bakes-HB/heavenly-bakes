import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
