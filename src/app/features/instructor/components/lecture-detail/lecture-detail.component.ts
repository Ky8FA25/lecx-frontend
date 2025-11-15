import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface FileItem {
  fileId: number;
  fileName: string;
  filePath: string;
}

interface Lecture {
  id: number;
  title: string;
  description: string;
  videoFile?: FileItem | null;
  documents: FileItem[];
}

@Component({
  selector: 'app-lecture-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lecture-detail.component.html',
  styleUrls: ['./lecture-detail.component.scss']
})

export class LectureDetailComponent implements OnInit {
  lecture: Lecture = {
    id: 0,
    title: '',
    description: '',
    documents: []
  };

  uploadVideoForm!: FormGroup;
  uploadDocForm!: FormGroup;
  updateForm!: FormGroup;

  videoFile: FileItem | null = null;
  documents: FileItem[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.lecture = {
      id: 1,
      title: 'Lecture 1: Introduction to JavaScript',
      description: 'This is the lecture description.',
      documents: [
        { fileId: 1, fileName: 'Assignment2_Login_Sqlite.pdf', filePath: '/assets/sample-pdf.pdf' }
      ]
    };

    
    this.documents = this.lecture.documents;

    this.uploadVideoForm = this.fb.group({
      video: [null, Validators.required]
    });

    this.uploadDocForm = this.fb.group({
      docs: [null, Validators.required]
    });

    this.updateForm = this.fb.group({
      title: [this.lecture.title, Validators.required],
      description: [this.lecture.description, Validators.required]
    });
  }
  
  // ======= Upload / Delete Handlers =======

  onUploadVideoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadVideoForm.patchValue({ video: file });
    }
  }

  uploadVideo(): void {
    if (this.uploadVideoForm.valid) {
      const file = this.uploadVideoForm.get('video')?.value;
      this.videoFile = {
        fileId: Math.random(),
        fileName: file.name,
        filePath: URL.createObjectURL(file)
      };
      alert('Video uploaded successfully!');
    }
  }

  onUploadDocChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploadDocForm.patchValue({ docs: files });
    }
  }

  uploadDocuments(): void {
    if (this.uploadDocForm.valid) {
      const files: FileList = this.uploadDocForm.get('docs')?.value;
      Array.from(files).forEach((f: File) => {
        this.documents.push({
          fileId: Math.random(),
          fileName: f.name,
          filePath: URL.createObjectURL(f)
        });
      });
      alert('Documents uploaded successfully!');
    }
  }

  deleteFile(fileId: number): void {
    if (this.videoFile && this.videoFile.fileId === fileId) {
      this.videoFile = null;
    } else {
      this.documents = this.documents.filter(d => d.fileId !== fileId);
    }
  }

  updateLecture(): void {
    if (this.updateForm.valid && this.lecture) {
      this.lecture.title = this.updateForm.value.title;
      this.lecture.description = this.updateForm.value.description;
      alert('Lecture updated successfully!');
    }
  }

  deleteLecture(): void {
    alert(`Lecture "${this.lecture?.title}" deleted.`);
  }

  goPrevious(): void {
    if (!this.lecture) return;
    const prevId = this.lecture.id - 1;
    if (prevId > 0) {
      window.location.href = `/instructor/lectures/${prevId}`;
    }
  }

  goNext(): void {
    if (!this.lecture) return;
    const nextId = this.lecture.id + 1;
    window.location.href = `/instructor/lectures/${nextId}`;
  }

  getFileIcon(doc: FileItem): string {
    if (doc.fileName.endsWith('.pdf')) return 'bi bi-file-earmark-pdf-fill text-danger';
    if (doc.fileName.endsWith('.doc') || doc.fileName.endsWith('.docx')) return 'bi bi-file-earmark-word-fill text-primary';
    if (doc.fileName.endsWith('.ppt') || doc.fileName.endsWith('.pptx')) return 'bi bi-file-earmark-slides-fill text-warning';
    return 'bi bi-file-earmark text-secondary';
  }
}
