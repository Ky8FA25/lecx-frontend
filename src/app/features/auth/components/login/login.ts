import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { environment } from '../../../../../environments/environment.development';
import { Router, RouterLink } from '@angular/router';
import { GenericServices } from '../../../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private router = inject(Router);
  private genericService = inject(GenericServices);

  loginform: FormGroup = new FormGroup({
    EmailOrUserName: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  onLoginSubmit() {
  if (!this.loginform.valid) {
    console.warn('❌ Form invalid!');
    this.loginform.markAllAsTouched();
    return;
  }

  const formData = this.loginform.value;

  this.genericService.post<any>('api/auth/login', formData)
    .subscribe({
      next: (response: any) => {
        console.log('✅ Login successful:', response);
        this.genericService.showSuccess('Login successful');

        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;

        let userRole = null;
        let userData = null;

        if (response.user) {
          userRole = response.user.roles && response.user.roles.length > 0 
            ? response.user.roles[0] 
            : null;
          
          userData = {
            id: response.user.id,
            email: response.user.email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            avatarUrl: response.user.avatarUrl,
            role: userRole
          };
        }

        // Nếu là admin → redirect sang FE Admin Vite từ env
        if (userRole === 'Admin') {
          const viteAdminUrl = environment.adminFEUrl + '/login-direct'; // lấy từ env
          // const redirectUrl = `${viteAdminUrl}?access=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}&user=${encodeURIComponent(JSON.stringify(userData))}`;
          window.location.href = viteAdminUrl;
          return;
        }

        // Nếu không phải admin → lưu localStorage và redirect bình thường
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        if (userData) localStorage.setItem('user', JSON.stringify(userData));

        this.router.navigate(['/home/main']);
      },
      error: (err) => {
        console.error('❌ Login failed:', err);
        this.genericService.showError('Login failed! Please try again.');
      }
    });
}

  onGoogleLogin() {
    console.log('🚀 Opening Google login popup...');
    const backendUrl = `${environment.apiBEUrl}/api/auth/google-login`;
    const returnUrl = window.location.origin + '/home/main';

    const googleLoginUrl = `${backendUrl}?returnUrl=${encodeURIComponent(
      returnUrl
    )}&opener=${encodeURIComponent(window.location.origin)}`;
    console.log('🌐 Google login URL:', googleLoginUrl);
    // Mở popup Google login
    const popup = window.open(
      googleLoginUrl,
      'GoogleLogin',
      'width=500,height=600'
    );

    // Nhận thông tin trả về từ callback
    window.addEventListener('message', (event) => {
      if (!event.data) return;

      if (event.data.error) {
        console.error('❌ Google Login Error:', event.data.error.message);
        this.genericService.showError(event.data.error.message);
        return;
      }

      // ✅ Nhận token và user từ backend
      const { token, user, returnUrl } = event.data;
      console.log('✅ Google Login success:', user);

      // Lưu token
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      this.genericService.showSuccess('Google login successful!');
      this.router.navigateByUrl(returnUrl || '/home/main');

      popup?.close();
    });
  }
}
