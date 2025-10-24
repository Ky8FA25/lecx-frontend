import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { ToastrService } from 'ngx-toastr';
import { GenericServices } from '../../../../core/services/GenericServices';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { EditUserDto } from '../../models/editUserDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-user-profile',
  imports: [SharedModule],
  templateUrl: './edit-user-profile.html',
  styleUrl: './edit-user-profile.scss'
})
export class EditUserProfile implements OnInit, OnDestroy{
  private toastr = inject(ToastrService);
  private genericService = inject(GenericServices);
  private router = inject(Router);
private subscriptions = new Subscription();
  userProfile = signal<EditUserDto | null>(null);

  formModel : FormGroup = new FormGroup({
    firstName: new FormControl(''),
  lastName: new FormControl(''),
  address: new FormControl(''),
  phoneNumber: new FormControl(''),
  dob: new FormControl(null),
  gender: new FormControl()
 // profileImage: new FormControl(null)
  });


  ngOnInit(): void {
    const loadUserProfile = this.genericService.get('api/profile/me').subscribe({
      next: (data : any) => {
        this.userProfile.set(data);
        console.log('✅ User profile loaded:', this.userProfile());
        this.formModel.patchValue({
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender?.toString(),
        phoneNumber: data.phoneNumber
      });
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.toastr.error('Failed to load user profile', 'Error');
      }
    });
    this.subscriptions.add(loadUserProfile);
  }

  onSubmit(): void {
    if (this.formModel.invalid) {
    this.toastr.warning('Please fill in all required fields', 'Warning');
    return;
  }
    const body = {
    userId: this.userProfile()?.id ?? '',
    firstName: this.formModel.value.firstName,
    lastName: this.formModel.value.lastName,
    address: this.formModel.value.address,
    dob: this.formModel.value.dob,
    gender: Number(this.formModel.value.gender),
    phoneNumber: this.formModel.value.phoneNumber
  };

  console.log(body.userId)

    const submit = this.genericService.put('api/user/profile/edit', body).subscribe({
      next: (response: any) => {
      this.toastr.success('Profile updated successfully', 'Success');
      console.log('✅ Updated:', response);
      this.router.navigateByUrl('/user/profile');
    },
    error: (err) => {
      console.error('❌ Update failed:', err);
      this.toastr.error('Failed to update profile', 'Error');
    }
  });
  this.subscriptions.add(submit);
}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }


}
