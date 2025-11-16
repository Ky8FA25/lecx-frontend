import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { ApiResponse } from '../../../../core/models/generic-response-class';
import { CourseMaterialDTO } from '../../../instructor/models/instructor.models';
import { StudentService } from '../../services/student-service';

@Component({
  selector: 'app-material-list',
  imports: [CommonModule, SharedModule],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialList implements OnInit, OnDestroy {
  materials = signal<CourseMaterialDTO[]>([]);
  loading = signal<boolean>(false);
  studentCourseID: number | undefined;
  courseID: number | undefined;
  
  private route = inject(ActivatedRoute);
  private genericService = inject(GenericServices);
  private studentService = inject(StudentService);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Lấy studentcourseID từ route params (từ course-layout)
    const parentRoute = this.route.parent;
    const studentCourseIDParam = parentRoute?.snapshot.paramMap.get('studentcourseID');
    
    if (studentCourseIDParam) {
      this.studentCourseID = Number(studentCourseIDParam);
      
      if (this.studentCourseID) {
        // Bước 1: Load student course detail để lấy courseID
        this.loadStudentCourseDetail(this.studentCourseID);
      }
    } else {
      console.error('❌ StudentCourseID not found in route params');
      this.genericService.showError('Course not found');
    }
  }

  /**
   * Load student course detail để lấy courseID
   * Sau đó dùng courseID để load materials
   */
  loadStudentCourseDetail(studentCourseID: number): void {
    const studentcourseSub = this.studentService
      .getStudentCourseDetailById('api/student-courses', studentCourseID)
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            // Lấy courseID từ API response
            const courseId = res.data?.courseId || res.data?.course?.courseId;
            
            if (courseId) {
              this.courseID = courseId;
              console.log('✅ Course ID loaded:', this.courseID);
              
              // Bước 2: Load materials sau khi đã có courseID
              this.loadMaterials();
            } else {
              console.warn('⚠️ CourseID not found in response');
              this.genericService.showError('Failed to load course information');
            }
          }
        },
        error: (err) => {
          console.error('❌ Failed to load student course detail:', err);
          this.genericService.showError('Failed to load course information');
        }
      });

    this.subscriptions.add(studentcourseSub);
  }

  loadMaterials(): void {
    if (!this.courseID) {
      console.warn('⚠️ CourseID not available, cannot load materials');
      return;
    }
    
    this.loading.set(true);
    const courseIdValue = Number(this.courseID);
    
    const sub = this.genericService.get<ApiResponse<CourseMaterialDTO[]>>(
      `api/course-materials/course/${courseIdValue}`
    ).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.materials.set(response.data);
        } else {
          this.genericService.showError(response.message || 'Failed to load materials');
          this.materials.set([]);
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error loading materials:', error);
        this.genericService.showError('Failed to load materials. Please try again.');
        this.materials.set([]);
      }
    });
    
    this.subscriptions.add(sub);
  }

  getIconClass(fileExtension: string): string {
    const ext = fileExtension.toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'fas fa-file-pdf text-danger';
      case '.pptx':
      case '.ppt':
        return 'fas fa-file-powerpoint text-warning';
      case '.docx':
      case '.doc':
        return 'fas fa-file-word text-primary';
      case '.xlsx':
      case '.xls':
        return 'fas fa-file-excel text-success';
      default:
        return 'fas fa-file';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
