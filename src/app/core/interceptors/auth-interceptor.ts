import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Authservice } from '../services/authservice';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Authservice);
  const accessToken = authService.getAccessToken();

  let clonedReq = req;
 if (req.method === 'OPTIONS') {
    return next(req);
  }
  // 🔹 Nếu có accessToken thì gắn vào Header
  if (accessToken) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  // 🔹 Xử lý lỗi (như 401 Unauthorized)
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Gọi refresh token
        return authService.refreshToken().pipe(
          switchMap((tokens: any) => {
            authService.storeTokens(tokens);

            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.accessToken}`
              }
            });

            return next(newReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => new Error('Session expired'));
          })
        );
      }

      return throwError(() => error);
    })
  );
};
