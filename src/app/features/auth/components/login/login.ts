import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { environment } from '../../../../../environments/environment.development';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,                  
  imports: [SharedModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'
  ]
})
export class Login {

  http = inject(HttpClient);
  env = environment.apiUrl;

  loginform: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onLoginSubmit() {
    if (this.loginform.valid) {
      const formData = this.loginform.value;
      debugger;
      this.http.post(`${this.env}api/Users/login`, formData)
        .subscribe({
          next: (response : any) => {
            alert('Login successful!');
            debugger
            localStorage.setItem('Signintoken', response.token);
            console.log('Login successful:', response);
            alert(`Login successful! ${response.token}`);
          },
          error: (error) => {
            console.error('Login failed:', error);
          }
        });
    } else {
      console.warn('Form invalid!');
    }
  }
}
