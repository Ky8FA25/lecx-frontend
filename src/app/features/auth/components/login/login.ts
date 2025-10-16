import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  styleUrls: ['./login.scss'
  ]
})
export class Login {

  private router = inject(Router);
  private genericService = inject(GenericServices);
  private toastr = inject(ToastrService);


  loginform: FormGroup = new FormGroup({
    EmailOrUserName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
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
          this.toastr.success('Đăng nhập thành công!', 'Thành công');
          
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          this.router.navigate(['/home/main']);

          
        },
        error: (err) => {
          console.error('❌ Login failed:', err);
          this.genericService.showError('Login failed! Please try again.');
        }
      });
    }
}
