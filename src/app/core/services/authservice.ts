import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Role } from '../enums/enums';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  private baseUrl = environment.apiBEUrl; // API backend
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {
    const tok = localStorage.getItem(this.accessTokenKey);
    this.isAuthenticated.set(!!tok);
  }

  getRole(): Role {
    // Thử lấy từ localStorage user data
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.role) {
          // Nếu role là string, convert sang number
          if (typeof userData.role === 'string') {
            const roleMap: { [key: string]: Role } = {
              'Admin': Role.Admin,
              'Student': Role.Student,
              'Instructor': Role.Instructor,
              '1': Role.Admin,
              '2': Role.Student,
              '3': Role.Instructor
            };
            return roleMap[userData.role] || Role.Student;
          }
          return userData.role as Role;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Nếu không có trong localStorage, thử decode JWT token
    const token = this.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // JWT có thể chứa role trong claims như 'role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        const roleClaim = payload.role || payload.roles?.[0] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (roleClaim) {
          // Convert string role to number
          if (typeof roleClaim === 'string') {
            const roleMap: { [key: string]: Role } = {
              'Admin': Role.Admin,
              'Student': Role.Student,
              'Instructor': Role.Instructor,
              '1': Role.Admin,
              '2': Role.Student,
              '3': Role.Instructor
            };
            return roleMap[roleClaim] || Role.Student;
          }
          return roleClaim as Role;
        }
      } catch (e) {
        console.error('Error decoding JWT token:', e);
      }
    }
    
    // Default return Student role nếu không tìm thấy
    return Role.Student;
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
    
    // Lưu user data nếu có trong response
    if (tokens.user) {
      const userRole = tokens.user.roles && tokens.user.roles.length > 0 
        ? tokens.user.roles[0] 
        : null;
      
      const userData = {
        id: tokens.user.id,
        email: tokens.user.email,
        firstName: tokens.user.firstName,
        lastName: tokens.user.lastName,
        avatarUrl: tokens.user.avatarUrl,
        role: userRole
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    this.isAuthenticated.set(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  logout() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('user');
    this.isAuthenticated.set(false);
  }
}
