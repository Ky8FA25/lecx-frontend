import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Authservice);

  const accessToken = authService.getAccessToken();

  // 🔹 Nếu không có token → chuyển đến trang login
  if (!accessToken) {
    router.navigate(['/auth/signin'], {
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  return true;
};
