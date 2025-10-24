import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { SharedModule } from '../../../../core/shared/sharedModule';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GenericServices } from '../../../../core/services/GenericServices';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, SharedModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  private genericService = inject(GenericServices);
  private router = inject(Router);
  formModel: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  onSubmit(): void {
    if(this.formModel.invalid){
      this.genericService.showError('Please input right email format!');
      return;
    }
    const value = this.formModel.value;
    this.genericService.post<any>('api/auth/forgot-password', value).subscribe({
      next: (response : any) => {
        this.genericService.showSuccess(response.message);
        this.router.navigateByUrl('/auth/signin');
      },
      error: (error) => {
        this.genericService.showError(error);
      }
    })
  }

  }

