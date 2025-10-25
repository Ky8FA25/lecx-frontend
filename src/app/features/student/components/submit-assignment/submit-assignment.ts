import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-submit-assignment',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './submit-assignment.html',
  styleUrls: ['./submit-assignment.scss']
})
export class SubmitAssignment{
  form: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      submissionType: ['file'],
      submissionLink: ['']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  onSubmit() {
    const submissionType = this.form.value.submissionType;

    if (submissionType === 'file') {
      if (!this.selectedFile) {
        console.warn('No file selected!');
        return;
      }
      console.log('Submitting file:', this.selectedFile);
      // TODO: Gọi API upload file (FormData)
    } else if (submissionType === 'link') {
      const link = this.form.value.submissionLink;
      if (!link) {
        console.warn('No link provided!');
        return;
      }
      console.log('Submitting link:', link);
      // TODO: Gọi API submit link
    }
  }
}
