import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { SharedModule } from '../../../../core/shared/sharedModule';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GenericServices } from '../../../../core/services/GenericServices';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, SharedModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
 

  private genericService = inject(GenericServices);
  private router = inject(Router);
  private route = inject(ActivatedRoute)

  formModel: FormGroup = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  userId!: string;
  token!: string;

   ngOnInit(): void {
       this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      this.token = params['token'];
    });
  }


  
  resetPassword(): void {
    if (this.formModel.value.newPassword !== this.formModel.value.confirmPassword) {
      this.genericService.showError('Passwords do not matsch');
      return;
    }

    const body = {
      userId: this.userId,
      token: this.token,
      newPassword: this.formModel.value.newPassword,
      confirmPassword: this.formModel.value.confirmPassword
    };

    console.log(body)
    this.genericService.post<any>('api/auth/reset-password', body)
      .subscribe({
        next: (res: any) => {
          this.genericService.showSuccess(res.message || 'Password reset successfully');
          this.router.navigate(['/auth/signin']);
        },
        error: err => {
          this.genericService.showError(err.error.message || 'Reset failed');
        }
      });
  }
}
