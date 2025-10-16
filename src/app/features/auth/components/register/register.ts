import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { GenericServices } from '../../../../core/services/GenericServices';

@Component({
  selector: 'app-register',
  imports: [SharedModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private genericService = inject(GenericServices);
  private router = inject(Router);

  signupform: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required,])
  });

  onSignupSubmit() {
    if (!this.signupform.valid) {
      console.warn('❌ Form invalid!');
      this.signupform.markAllAsTouched();
      return;
    }
    const formData = this.signupform.value;
    this.genericService.post<any>('api/auth/register', formData)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Registration successful:', response);
          this.router.navigate(['/auth/login']);
        
        },
        error: (err) => {
          alert('Registration failed! Please try again.');
        }
       
      });
    }
}
