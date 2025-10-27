import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { GenericServices } from '../../../../core/services/GenericServices';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { EditUserDto } from '../../models/editUserDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-user-profile',
  imports: [SharedModule],
  templateUrl: './edit-user-profile.html',
  styleUrls: ['./edit-user-profile.scss']
})
export class EditUserProfile implements OnInit, OnDestroy {
  private genericService = inject(GenericServices);
  private router = inject(Router);
  private subscriptions = new Subscription();

  userProfile = signal<EditUserDto | null>(null);
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;

  formModel: FormGroup = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    address: new FormControl(''),
    phoneNumber: new FormControl(''),
    dob: new FormControl(null),
    gender: new FormControl()
  });

  ngOnInit(): void {
    const loadUserProfile = this.genericService.get('api/profile/me').subscribe({
      next: (data: any) => {
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
        this.uploadedImageUrl = data.profileImagePath; // ✅ hiện ảnh cũ
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.genericService.showError('Failed to load user profile');
      }
    });
    this.subscriptions.add(loadUserProfile);
  }

  // ✅ Khi người dùng chọn ảnh mới
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    // Preview tạm ảnh
    const reader = new FileReader();
    reader.onload = () => {
      this.uploadedImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async uploadImageAndGetUrl(): Promise<string | null> {
    if (!this.selectedFile) return null;

    const formData = new FormData();
    formData.append('File', this.selectedFile);
    formData.append('Prefix', 'public/user-avatars');

    return new Promise((resolve, reject) => {
      const upload = this.genericService.post('api/storage/upload', formData).subscribe({
        next: (res: any) => {
          console.log('📤 Upload success:', res);
          if (res?.publicUrl) {
            resolve(res.publicUrl);
          } else {
            reject('No URL returned');
          }
        },
        error: (err) => {
          console.error('❌ Upload failed:', err);
          reject(err);
        }
      });
      this.subscriptions.add(upload);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.formModel.invalid) {
      this.genericService.showWarning('Please fill in all required fields');
      return;
    }

    try {
      const currentProfileImage = this.uploadedImageUrl;
      let profileImageUrl: string | null =
        typeof currentProfileImage === 'string' ? currentProfileImage : null;
      if (this.selectedFile) {
        this.genericService.showInfo('Uploading image...', 'Please wait');
        profileImageUrl = await this.uploadImageAndGetUrl();
      }

      const body = {
        userId: this.userProfile()?.id ?? '',
        firstName: this.formModel.value.firstName,
        lastName: this.formModel.value.lastName,
        address: this.formModel.value.address,
        dob: this.formModel.value.dob,
        gender: Number(this.formModel.value.gender),
        phoneNumber: this.formModel.value.phoneNumber,
        profileImage: profileImageUrl
      };

      const submit = this.genericService.put('api/user/profile/edit', body).subscribe({
        next: (response: any) => {
          this.genericService.showSuccess('Profile updated successfully', 'Success');
          console.log('✅ Updated:', response);
          this.router.navigateByUrl('/user/profile');
        },
        error: (err) => {
          console.error('❌ Update failed:', err);
          this.genericService.showError('Failed to update profile', 'Error');
        }
      });
      this.subscriptions.add(submit);
    } catch (err) {
      this.genericService.showError('Image upload failed', 'Error');
      console.error(err);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
