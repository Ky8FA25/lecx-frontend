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
  private subscriptions = new Subscription();
  
  isAuthenticated = signal(false);
  user = signal<userDto | any>(null);
  courseID: string | undefined;
  lectures = signal<LectureDTO[]>([]);
  loadingLectures = signal<boolean>(false);
  isLecturesExpanded = signal<boolean>(false);
  
  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();
    this.courseID = this.route.snapshot.paramMap.get('courseID') ?? '';
    
    if (token) {
      this.isAuthenticated.set(true);
      this.loadUserProfile();
    }
    
    if (this.courseID) {
      this.loadLectures();
    }
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

  loadLectures(): void {
    if (!this.courseID) return;
    
    this.loadingLectures.set(true);
    const courseIdValue = Number(this.courseID);
    
    const filters = {
      CourseId: courseIdValue,
      PageIndex: 1,
      PageSize: 100 // Load all lectures
    };

    const lecturesSub = this.genericservice.getWithFilter('/api/lectures/course', filters).subscribe({
      next: (res: ApiResponse<LectureDTO[]> | ApiResponse<PaginatedResponse<LectureDTO>>) => {
        if (res.success) {
          let lectureList: LectureDTO[] = [];
          
          // Check if response is paginated or array
          if ('items' in (res.data as any)) {
            const paginatedData = res.data as PaginatedResponse<LectureDTO>;
            lectureList = paginatedData.items || [];
          } else {
            lectureList = (res.data as LectureDTO[]) || [];
          }
          
          this.lectures.set(lectureList);
        } else {
          this.lectures.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading lectures:', err);
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
    if (!lectureId) return;
    const courseId = this.courseID;
    if (courseId) {
      this.router.navigate(['/student/course', courseId, 'lecture-detail'], { 
        queryParams: { lectureId } 
      });
    }
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
