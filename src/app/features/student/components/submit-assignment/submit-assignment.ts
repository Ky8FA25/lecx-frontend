import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GenericServices } from '../../../../core/services/GenericServices';

@Component({
  selector: 'app-submit-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './submit-assignment.html',
  styleUrls: ['./submit-assignment.scss']
})
export class SubmitAssignment {
  form: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  private genericService = inject(GenericServices);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      submissionType: ['file'],
      submissionLink: ['']
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  async onSubmit() {
    const submissionType = this.form.value.submissionType;
    this.isSubmitting = true;

    try {
      let submissionLink: string | null = null;
      let fileName: string | null = null;

      // === CASE 1: SUBMIT FILE ===
      if (submissionType === 'file') {
        if (!this.selectedFile) {
          alert('Please select a file first!');
          return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('prefix', 'submissions');

        const uploadResponse: any = await this.genericService
          .post<any>('api/storage/upload', formData)
          .toPromise();

        if (!uploadResponse?.success) {
          throw new Error('File upload failed');
        }

        submissionLink = uploadResponse.publicUrl;
        fileName = this.selectedFile.name;

        console.log('✅ File uploaded successfully:', submissionLink);
      }

      // === CASE 2: SUBMIT LINK ===
      else if (submissionType === 'link') {
        submissionLink = this.form.value.submissionLink;
        if (!submissionLink) {
          alert('Please enter a link!');
          return;
        }
        fileName = null;
      }

      // === GỌI API TẠO SUBMISSION ===
      const submissionPayload = {
        assignmentId: 1, // TODO: thay bằng id thật (ví dụ lấy từ route)
        submissionLink: submissionLink,
        fileName: fileName,
        studentId: '', // backend có thể tự fill theo UserId, nhưng có field này thì vẫn gửi ''
      };

      const createResponse = await this.genericService
        .post<any>('api/submissions', submissionPayload)
        .toPromise();

      console.log('✅ Submission created:', createResponse);
      alert('Submit successfully!');
    } 
    catch (error) {
      console.error('❌ Submission error:', error);
      alert('Error while submitting assignment!');
    } 
    finally {
      this.isSubmitting = false;
    }
  }
}
