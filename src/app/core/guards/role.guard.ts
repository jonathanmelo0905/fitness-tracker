import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../shared/models/auth.model';

const TOKEN_KEY = 'nutrieval-token';

function getUserRole(token: string): UserRole | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.role as UserRole) ?? null;
  } catch {
    return null;
  }
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const userRole = getUserRole(token);
  const allowedRoles: UserRole[] = route.data['roles'] ?? [];

  if (allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole))) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
