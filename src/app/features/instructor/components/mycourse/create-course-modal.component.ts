import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-course-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-course-modal.component.html',
})
export class CreateCourseModalComponent implements OnInit {
  @Input() courseData: any | null = null;

  previewImageUrl: string | null = null;

  constructor(public activeModal: NgbActiveModal) {}

  course = {
    courseCode: '',
    title: '',
    description: '',
    categoryId: '',
    level: '',
    price: 0,
    coverImage: null as File | null,
    materials: [] as File[],
    coverImagePath: '' // ← cần để hiển thị ảnh cũ
  };

  ngOnInit() {
    if (this.courseData) {
      this.course = {
        ...this.courseData,
        coverImage: null,     // reset
        materials: []         // reset
      };

      if (this.courseData.coverImagePath) {
        this.previewImageUrl = this.courseData.coverImagePath;
      }
    }
  }

  onFileChange(event: Event, type: 'cover' | 'materials') {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    if (type === 'cover') {
      const file = input.files[0];
      this.course.coverImage = file;
      this.previewImageUrl = URL.createObjectURL(file);
    } else {
      this.course.materials = Array.from(input.files);
    }
  }

  saveCourse() {
    // Nếu không chọn ảnh mới mà đang update → giữ ảnh cũ
    if (!this.course.coverImage && this.courseData?.coverImagePath) {
      this.course.coverImagePath = this.courseData.coverImagePath;
    }
     // 👉 In toàn bộ dữ liệu ra console
  console.log('[Modal Output] Course Data:', {
    ...this.course,
    coverImage: this.course.coverImage?.name ?? 'Không có file mới',
    materials: this.course.materials.map(m => m.name)
  });

    this.activeModal.close(this.course);
  }
}
