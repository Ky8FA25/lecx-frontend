import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Role } from '../enums/enums';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  private baseUrl = environment.apiUrl; // API backend
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {
    const tok = localStorage.getItem(this.accessTokenKey);
    this.isAuthenticated.set(!!tok);
  }

  getRole(): Role {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.role as Role;
  }
  
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((tokens: any) => {
        this.storeTokens(tokens);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    return this.http.post(`${this.baseUrl}/api/auth/refresh`, { refreshToken });
  }

  storeTokens(tokens: any) {
    localStorage.setItem(this.accessTokenKey, tokens.accessToken);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    this.isAuthenticated.set(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  logout() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isAuthenticated.set(false);
  }
}
