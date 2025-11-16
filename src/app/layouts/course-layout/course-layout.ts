import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkWithHref, ActivatedRoute } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Authservice } from '../../core/services/authservice';
import { GenericServices } from '../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';
import { userDto } from '../../features/user/models/userDto';
import { LectureDTO } from '../../features/student/models/lecture';
import { ApiResponse, PaginatedResponse } from '../../core/models/generic-response-class';
import { StudentService } from '../../features/student/services/student-service';

@Component({
  selector: 'app-course-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLink, CommonModule],
  templateUrl: './course-layout.html',
  styleUrl: './course-layout.scss'
})
export class CourseLayout implements OnInit, OnDestroy {
  private authService = inject(Authservice);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private subscriptions = new Subscription();
  
  isAuthenticated = signal(false);
  user = signal<userDto | any>(null);
  studentCourseID: number | undefined;
  courseID: string | undefined;
  lectures = signal<LectureDTO[]>([]);
  loadingLectures = signal<boolean>(false);
  isLecturesExpanded = signal<boolean>(false);
  
  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();
    
    // Lấy studentcourseID từ route params (từ my-course.ts)
    const studentCourseIDParam = this.route.snapshot.paramMap.get('studentcourseID');
    
    if (studentCourseIDParam) {
      this.studentCourseID = Number(studentCourseIDParam);
      
      if (this.studentCourseID) {
        // Bước 1: Load student course detail để lấy courseID
        this.loadStudentCourseDetail(this.studentCourseID);
      }
    }
    
    if (token) {
      this.isAuthenticated.set(true);
      this.loadUserProfile();
    }
  }

  /**
   * Load student course detail để lấy courseID
   * Sau đó dùng courseID để load lectures
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
              this.courseID = courseId.toString();
              console.log('✅ Course ID loaded:', this.courseID);
              
              // Bước 2: Load lectures sau khi đã có courseID
              this.loadLectures();
            } else {
              console.warn('⚠️ CourseID not found in response');
            }
          }
        },
        error: (err) => {
          console.error('❌ Failed to load student course detail:', err);
        }
      });

    this.subscriptions.add(studentcourseSub);
  }

  loadUserProfile() {
    const userSub = this.genericservice.get('api/profile/me').subscribe({
      next: (data) => {
        this.user.set(data);
        console.log('✅ User profile loaded:', this.user());
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.toastr.error('Failed to load user profile', 'Error');
        this.logout();
      }
    });
    this.subscriptions.add(userSub);
  }

  /**
   * Load lectures sử dụng courseID đã lấy từ API student-course
   */
  loadLectures(): void {
    if (!this.courseID) {
      console.warn('⚠️ CourseID not available, cannot load lectures');
      return;
    }
    
    this.loadingLectures.set(true);
    const courseIdValue = Number(this.courseID);
    
    const filters = {
      courseId: courseIdValue,  // Sử dụng courseId (chữ thường) thay vì CourseId
      pageIndex: 1,
      pageSize: 100 // Load all lectures
    };

    const lecturesSub = this.genericservice.getWithFilter('/api/lectures/course', filters).subscribe({
      next: (res: ApiResponse<LectureDTO[]> | ApiResponse<PaginatedResponse<LectureDTO>>) => {
        if (res.success) {
          let lectureList: LectureDTO[] = [];
          
          // Check if response is paginated or array
          if ('items' in (res.data as any)) {
            const paginatedData = res.data as PaginatedResponse<LectureDTO>;
            lectureList = paginatedData.items || [];
          } else if (Array.isArray(res.data)) {
            lectureList = res.data;
          }
          
          this.lectures.set(lectureList);
          console.log('✅ Lectures loaded:', lectureList.length);
        } else {
          console.warn('⚠️ No lectures found');
          this.lectures.set([]);
        }
      },
      error: (err) => {
        console.error('❌ Error loading lectures:', err);
        this.lectures.set([]);
      },
      complete: () => {
        this.loadingLectures.set(false);
      }
    });

    this.subscriptions.add(lecturesSub);
  }

  toggleLectures(): void {
    this.isLecturesExpanded.set(!this.isLecturesExpanded());
  }

  goToLecture(lectureId: number | undefined): void {
    if (!lectureId || !this.studentCourseID) return;
    
    // Navigate với studentCourseID từ route params
    this.router.navigate(['/student/course', this.studentCourseID, 'lecture-detail'], { 
      queryParams: { lectureId } 
    });
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.router.navigate(['/auth/signin']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
