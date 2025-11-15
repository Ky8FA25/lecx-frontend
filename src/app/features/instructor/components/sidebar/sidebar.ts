import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Authservice } from '../../../../core/services/authservice';
import { InstructorLectureService } from '../../services/lecture.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { LectureDTO } from '../../models/instructor.models';
import { Role } from '../../../../core/enums/enums';
import { CourseModel } from '../../models/instructor.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(Authservice);
  private lectureService = inject(InstructorLectureService);
  private genericService = inject(GenericServices);

  courseId = signal<number | null>(null);
  isInstructor = signal<boolean>(false);
  lectures = signal<LectureDTO[]>([]); // Luôn là array, không bao giờ null/undefined
  lecturesExpanded = signal<boolean>(false);
  loading = signal<boolean>(false);
  currentRoute = signal<string>('');

  // Computed để check active state
  isDashboardActive = computed(() => this.currentRoute() === 'dashboard');
  isMaterialsActive = computed(() => this.currentRoute() === 'materials');
  isLecturesActive = computed(() => this.currentRoute() === 'lectures');
  isTestsActive = computed(() => this.currentRoute() === 'tests');
  isAssignmentsActive = computed(() => this.currentRoute() === 'assignments');
  isLivestreamActive = computed(() => this.currentRoute() === 'livestream');
  isGradesActive = computed(() => this.currentRoute() === 'grades');
  isCourseInfoActive = computed(() => this.currentRoute() === 'course-info');

  ngOnInit() {
    console.log('🔍 Sidebar Component initialized');
    
    // Lấy courseId từ route params (ưu tiên) hoặc query params (fallback)
    this.route.params.subscribe(params => {
      const courseId = params['courseId'];
      console.log('📋 Route params:', params, 'courseId:', courseId);
      
      if (courseId) {
        this.courseId.set(+courseId);
        console.log('✅ CourseId from route params:', courseId);
        this.checkUserRole(+courseId);
        this.loadLectures(+courseId);
      } else {
        // Fallback: lấy từ query params
        this.route.queryParams.subscribe(queryParams => {
          const courseIdFromQuery = queryParams['CourseID'] || queryParams['courseId'];
          console.log('📋 Query params:', queryParams, 'courseId:', courseIdFromQuery);
          
          if (courseIdFromQuery && !this.courseId()) {
            this.courseId.set(+courseIdFromQuery);
            console.log('✅ CourseId from query params:', courseIdFromQuery);
            this.checkUserRole(+courseIdFromQuery);
            this.loadLectures(+courseIdFromQuery);
          }
        });
      }
    });

    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        if (url.includes('/dashboard')) {
          this.currentRoute.set('dashboard');
        } else if (url.includes('/materials')) {
          this.currentRoute.set('materials');
        } else if (url.includes('/lectures') || url.includes('/lecture-detail')) {
          this.currentRoute.set('lectures');
        } else if (url.includes('/tests')) {
          this.currentRoute.set('tests');
        } else if (url.includes('/assignments')) {
          this.currentRoute.set('assignments');
        } else if (url.includes('/livestream')) {
          this.currentRoute.set('livestream');
        } else if (url.includes('/grades')) {
          this.currentRoute.set('grades');
        } else if (url.includes('/course-info')) {
          this.currentRoute.set('course-info');
        }
      });
  }

  /**
   * Kiểm tra user có phải là instructor của course không
   */
  checkUserRole(courseId: number) {
    // Lấy course info để check instructorId
    this.genericService.get<{ success: boolean; data: CourseModel }>(`api/courses/${courseId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const currentUserId = this.getCurrentUserId();
          const role = this.authService.getRole();
          
          // Check nếu user là instructor của course hoặc có role Instructor/Admin
          this.isInstructor.set(
            response.data.instructorId === currentUserId || 
            role === Role.Instructor || 
            role === Role.Admin
          );
        }
      },
      error: (err) => {
        console.error('Error checking user role:', err);
        // Default: check role
        const role = this.authService.getRole();
        this.isInstructor.set(role === Role.Instructor || role === Role.Admin);
      }
    });
  }

  /**
   * Lấy current user ID
   */
  private getCurrentUserId(): string | null {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.id || null;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  }

  /**
   * Load danh sách lectures
   */
  loadLectures(courseId: number) {
    this.loading.set(true);
    this.lectureService.getLecturesByCourse(courseId).subscribe({
      next: (response) => {
        console.log('📚 Lectures API Response:', response);
        
        if (response.success && response.data) {
          // Đảm bảo response.data là array
          const lecturesArray = Array.isArray(response.data) ? response.data : [];
          console.log('✅ Setting lectures array:', lecturesArray.length);
          this.lectures.set(lecturesArray);
        } else {
          console.warn('⚠️ No lectures data in response');
          this.lectures.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading lectures:', err);
        this.lectures.set([]); // Set empty array on error
        this.loading.set(false);
      }
    });
  }

  /**
   * Toggle lectures menu (expand/collapse)
   */
  toggleLectures() {
    this.lecturesExpanded.set(!this.lecturesExpanded());
  }

  /**
   * Mở modal tạo lecture (sẽ được implement sau)
   */
  openCreateLectureModal() {
    // TODO: Implement modal trigger
    console.log('Open create lecture modal');
  }

  /**
   * Navigate to lecture detail
   */
  goToLecture(lectureId: number) {
    const courseId = this.courseId();
    if (courseId) {
      if (this.isInstructor()) {
        this.router.navigate(['/instructor/courses', courseId, 'lectures', lectureId]);
      } else {
        this.router.navigate(['/student/lecture-detail'], { queryParams: { lectureId } });
      }
    }
  }

  /**
   * Check if lectures is a valid array
   */
  hasLectures(): boolean {
    const lecturesList = this.lectures();
    return Array.isArray(lecturesList) && lecturesList.length > 0;
  }
}

