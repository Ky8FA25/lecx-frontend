import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, switchMap, throwError } from 'rxjs';
import { Authservice } from '../services/authservice';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Authservice);
  const accessToken = authService.getAccessToken();

  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }
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

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);
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
    }

      return throwError(() => error);
    })
  );
};
