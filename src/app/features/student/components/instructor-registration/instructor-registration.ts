import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { Subscription } from 'rxjs';
import { ApiResponse } from '../../../../core/models/generic-response-class';

interface UploadFileResponse {
  success: boolean;
  objectName?: string;
  publicUrl?: string;
  fileName?: string;
  // Handle both uppercase and lowercase response formats
  Success?: boolean;
  ObjectName?: string;
  PublicUrl?: string;
  FileName?: string;
}

interface CreateInstructorConfirmationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Component({
  selector: 'app-instructor-registration',
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './instructor-registration.html',
  styleUrl: './instructor-registration.scss'
})
export class InstructorRegistration implements OnDestroy {
  selectedFile: File | null = null;
  description: string = '';
  submitting = signal<boolean>(false);
  uploading = signal<boolean>(false);
  showModal = signal<boolean>(false);

  private genericService = inject(GenericServices);
  private subscriptions = new Subscription();

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        this.genericService.showError('Please upload a PDF file');
        event.target.value = '';
        return;
      }
      // Validate file size (e.g., max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.genericService.showError('File size must be less than 20MB');
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
      console.log('File selected:', file.name);
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async uploadFile(): Promise<UploadFileResponse | null> {
    if (!this.selectedFile) {
      this.genericService.showError('Please select a file');
      return null;
    }

    this.uploading.set(true);

    const formData = new FormData();
    formData.append('File', this.selectedFile);
    formData.append('Prefix', 'public/instructor-confirmations');

    return new Promise((resolve, reject) => {
      const uploadSub = this.genericService.post<UploadFileResponse>('api/storage/upload', formData).subscribe({
        next: (res: UploadFileResponse) => {
          console.log('✅ File uploaded successfully:', res);
          // Handle both uppercase and lowercase response formats
          const success = res.success || res.Success;
          const publicUrl = res.publicUrl || res.PublicUrl;
          const fileName = res.fileName || res.FileName;
          
          if (success && publicUrl) {
            this.uploading.set(false);
            resolve({
              success: true,
              publicUrl: publicUrl,
              fileName: fileName || this.selectedFile?.name || 'file',
              objectName: res.objectName || res.ObjectName || ''
            });
          } else {
            this.uploading.set(false);
            this.genericService.showError('Failed to upload file');
            reject('Upload failed');
          }
        },
        error: (err) => {
          console.error('❌ Upload failed:', err);
          this.uploading.set(false);
          this.genericService.showError('Failed to upload file. Please try again.');
          reject(err);
        }
      });
      this.subscriptions.add(uploadSub);
    });
  }

  async onSubmit(): Promise<void> {
    // Validate form
    if (!this.selectedFile) {
      this.genericService.showError('Please upload your CV (PDF)');
      return;
    }

    if (!this.description || this.description.trim().length < 20) {
      this.genericService.showError('Please enter a message with at least 20 characters');
      return;
    }

    this.submitting.set(true);

    try {
      // Step 1: Upload file
      const uploadResponse = await this.uploadFile();
      
      if (!uploadResponse) {
        this.submitting.set(false);
        return;
      }

      // Step 2: Create instructor confirmation
      const confirmationRequest = {
        fileName: uploadResponse.fileName,
        certificatelink: uploadResponse.publicUrl,
        description: this.description.trim()
      };

      console.log('Creating instructor confirmation:', confirmationRequest);

      const confirmationSub = this.genericService.post<ApiResponse<CreateInstructorConfirmationResponse>>(
        'api/instructor-confirmations',
        confirmationRequest
      ).subscribe({
        next: (res: ApiResponse<CreateInstructorConfirmationResponse>) => {
          console.log('✅ Instructor confirmation created:', res);
          if (res.success) {
            this.genericService.showSuccess('Application submitted successfully! We will review your application soon.');
            // Reset form
            this.resetForm();
            // Close modal
            this.closeModal();
          } else {
            this.genericService.showError(res.message || 'Failed to submit application');
          }
          this.submitting.set(false);
        },
        error: (err) => {
          console.error('❌ Failed to create instructor confirmation:', err);
          this.genericService.showError(err.error?.message || 'Failed to submit application. Please try again.');
          this.submitting.set(false);
        }
      });

      this.subscriptions.add(confirmationSub);

    } catch (error) {
      console.error('❌ Error submitting application:', error);
      this.submitting.set(false);
    }
  }

  resetForm(): void {
    this.selectedFile = null;
    this.description = '';
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
