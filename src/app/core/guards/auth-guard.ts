import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';
import { Role } from '../enums/enums';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Authservice);

  const accessToken = authService.getAccessToken();
  const expectedRoles = route.data['roles'] as Role[];
  const userRole = authService.getRole();
  
  console.log('🔐 Auth Guard Check:', {
    hasToken: !!accessToken,
    expectedRoles,
    userRole,
    route: state.url
  });
  
  if (!accessToken) {
    console.log('❌ No access token, redirecting to login');
    router.navigate(['/auth/signin'], {
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
  
  if (expectedRoles && expectedRoles.length > 0) {
    if (!expectedRoles.includes(userRole)) {
      console.log('❌ Role mismatch:', {
        userRole,
        expectedRoles,
        userRoleName: Role[userRole]
      });
      router.navigate(['/unauthorized']);
      return false;
    }
    console.log('✅ Role check passed');
  }

  return true;
};
