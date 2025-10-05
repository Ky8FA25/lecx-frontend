import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, catchError, of, switchMap, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api = environment.apiUrl;
  private accessToken: string | null = null; // chỉ lưu trong memory
  private isRefreshing = false;
  private tokenRefreshed = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>(
      `${this.api}/auth/login`,
      { email, password },
      { withCredentials: true } // ⚠️ cần để cookie HTTPOnly được gửi
    ).pipe(
      tap(res => this.accessToken = res.accessToken)
    );
  }

  getToken() {
    return this.accessToken;
  }

  refreshToken() {
    if (this.isRefreshing) {
      return this.tokenRefreshed.pipe(
        switchMap(() => of(this.accessToken))
      );
    }

    this.isRefreshing = true;

    return this.http.post<{ accessToken: string }>(
      `${this.api}/auth/refresh-token`, {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        this.isRefreshing = false;
        this.tokenRefreshed.next(true);
      }),
      catchError(err => {
        this.isRefreshing = false;
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.accessToken = null;
  }
}
