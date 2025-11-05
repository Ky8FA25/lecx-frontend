import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericServices } from '../../../../core/services/GenericServices';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-change-password',
  imports: [SharedModule],
  templateUrl: './user-change-password.html',
  styleUrl: './user-change-password.scss'
})
export class UserChangePassword implements OnInit, OnDestroy {
  private toastr = inject(ToastrService);
  private genericService = inject(GenericServices);
  private router = inject(Router);
  private subscriptions = new Subscription(); 


  formModel : FormGroup = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  private userId = signal<string | null>(null);

  ngOnInit(): void {
   const userprofile = this.genericService.get('api/profile/me').subscribe({
      next: (data : any) => {
        this.userId.set(data.id);
        console.log(this.userId());
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.toastr.error('Failed to load user profile', 'Error');
      }
    });
    this.subscriptions.add(userprofile);
  }

  onSubmit() {
    if (this.formModel.invalid) {
      this.toastr.warning('Please fill in all fields correctly.');
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.formModel.value;

    if (newPassword !== confirmPassword) {
      this.toastr.error('New password and confirmation do not match.');
      return;
    }

   const changePassword =  this.genericService
      .post('api/user/change-password', {
        userId: this.userId(),
        currentPassword,
        newPassword,
        confirmPassword
      })
      .subscribe({
        next: (res: any) => {
          this.toastr.success('Password changed successfully!');
          this.router.navigate(['/user/profile']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to change password.');
        }
      });
      this.subscriptions.add(changePassword);
    }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}