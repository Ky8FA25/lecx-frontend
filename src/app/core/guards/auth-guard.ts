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
  // 🔹 Nếu không có token → chuyển đến trang login
  if (!accessToken) {
    router.navigate(['/auth/signin'], {
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
  
   if (expectedRoles && !expectedRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
