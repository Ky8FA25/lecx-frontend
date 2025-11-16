import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { InstructorService } from '../../services/instructor.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { CourseModel } from '../../models/instructor.models';
import { CategoryDto } from '../../../home/models/categoryDto';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../../core/models/generic-response-class';

@Component({
  selector: 'app-instructor-course-info',
  standalone: true,
  imports: [SharedModule, RouterLink, CommonModule],
  templateUrl: './course-info.html',
  styleUrl: './course-info.scss'
})
export class InstructorCourseInfo implements OnInit {
  private route = inject(ActivatedRoute);
  private instructorService = inject(InstructorService);
  private genericService = inject(GenericServices);

  course = signal<CourseModel | null>(null);
  category = signal<CategoryDto | null>(null);
  loading = signal<boolean>(false);
  lectureCount = signal<number>(0);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = params['courseId'];
      if (courseId) {
        const id = Number(courseId);
        console.log('📚 Loading course detail for ID:', id);
        this.loadCourseDetail(id);
      }
    });
  }

  loadCourseDetail(courseId: number) {
    this.loading.set(true);
    
    // Get course detail using GET /api/courses/{CourseId}
    this.instructorService.getCourseById(courseId).subscribe({
      next: (response: any) => {
        console.log('✅ Course detail API Response:', response);
        console.log('📋 Response structure:', {
          hasSuccess: !!response?.success,
          hasData: !!response?.data,
          hasCourseId: !!response?.courseId,
          responseKeys: response ? Object.keys(response) : [],
          dataKeys: response?.data ? Object.keys(response.data) : []
        });
        
        // Handle different response formats
        let courseData: CourseModel | null = null;
        
        if (response) {
          // Format 1: { success: true, data: {...} }
          if (response.success && response.data) {
            console.log('✅ Format 1: ApiResponse with data');
            courseData = response.data;
          }
          // Format 2: { data: {...} } without success
          else if (response.data && !response.success) {
            if (response.data.courseId) {
              console.log('✅ Format 2: Data without success');
              courseData = response.data;
            } else {
              // Check if data itself is the course object
              console.log('✅ Format 2b: Data is course object');
              courseData = response.data;
            }
          }
          // Format 3: { courseDtos: {...} } - API returns courseDtos property
          else if (response.courseDtos) {
            console.log('✅ Format 3: Response with courseDtos');
            // courseDtos might be an object or array
            if (response.courseDtos.courseId) {
              courseData = response.courseDtos;
            } else if (Array.isArray(response.courseDtos) && response.courseDtos.length > 0) {
              courseData = response.courseDtos[0];
            } else {
              // Try to use courseDtos directly if it has courseId
              courseData = response.courseDtos;
            }
          }
          // Format 4: Direct CourseModel
          else if (response.courseId) {
            console.log('✅ Format 4: Direct CourseModel');
            courseData = response;
          }
          else {
            console.warn('⚠️ Unknown response format:', response);
            console.warn('Response keys:', Object.keys(response));
            if (response.data) {
              console.warn('Data keys:', Object.keys(response.data));
              console.warn('Data content:', response.data);
            }
            if (response.courseDtos) {
              console.warn('CourseDtos keys:', Object.keys(response.courseDtos));
              console.warn('CourseDtos content:', response.courseDtos);
            }
          }
        }
        
        if (courseData && courseData.courseId) {
          this.course.set(courseData);
          console.log('✅ Course loaded successfully:', courseData);
          
          // Load category detail
          if (courseData.categoryId) {
            this.loadCategoryDetail(courseData.categoryId);
          }
          
          // Load lecture count
          this.loadLectureCount(courseId);
        } else {
          console.error('❌ Invalid course data format - courseId missing');
          console.error('Course data received:', courseData);
          this.genericService.showError('Failed to load course details: Invalid response format');
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Failed to load course detail:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error
        });
        this.genericService.showError(err.error?.message || 'Failed to load course details');
        this.loading.set(false);
      }
    });
  }

  loadCategoryDetail(categoryId: number) {
    this.genericService.get<any>(`api/categories/${categoryId}`).subscribe({
      next: (response: any) => {
        console.log('✅ Category API Response:', response);
        
        let categoryData: CategoryDto | null = null;
        
        // Handle different response formats
        if (response) {
          // Format 1: { success: true, data: {...} }
          if (response.success && response.data) {
            categoryData = {
              categoryId: response.data.categoryId,
              fullName: response.data.fullName || response.data.categoryName || response.data.name || 'Unknown',
              description: response.data.description || ''
            };
          }
          // Format 2: Direct category object
          else if (response.categoryId) {
            categoryData = {
              categoryId: response.categoryId,
              fullName: response.fullName || response.categoryName || response.name || 'Unknown',
              description: response.description || ''
            };
          }
        }
        
        if (categoryData) {
          this.category.set(categoryData);
          console.log('✅ Category loaded:', categoryData);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load category detail:', err);
      }
    });
  }

  loadLectureCount(courseId: number) {
    this.genericService.get<any>(`api/lectures/course?courseId=${courseId}`).subscribe({
      next: (response: any) => {
        console.log('✅ Lectures API Response:', response);
        
        let count = 0;
        
        // Handle different response formats
        if (response) {
          // Format 1: { success: true, data: [...] }
          if (response.success && response.data && Array.isArray(response.data)) {
            count = response.data.length;
          }
          // Format 2: Direct array
          else if (Array.isArray(response)) {
            count = response.length;
          }
          // Format 3: { data: [...] } without success
          else if (response.data && Array.isArray(response.data)) {
            count = response.data.length;
          }
        }
        
        this.lectureCount.set(count);
        console.log('✅ Lecture count:', count);
      },
      error: (err) => {
        console.error('❌ Failed to load lecture count:', err);
        this.lectureCount.set(0);
      }
    });
  }

  getLevelLabel(level: string): string {
    const map: { [key: string]: string } = {
      'Beginner': 'Beginner',
      'Intermediate': 'Intermediate',
      'Advanced': 'Advanced',
      '0': 'Beginner',
      '1': 'Intermediate',
      '2': 'Advanced'
    };
    return map[level] || level;
  }
}

