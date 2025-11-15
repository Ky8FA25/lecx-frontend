import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute, RouterLinkActive, NavigationEnd } from "@angular/router";
import { Authservice } from '../../core/services/authservice';
import { GenericServices } from '../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';
import { userDto } from '../../features/user/models/userDto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { InstructorLectureService } from '../../features/instructor/services/lecture.service';
import { LectureDTO, CreateLectureDto } from '../../features/instructor/models/instructor.models';

@Component({
  selector: 'app-instructor-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './instructor-layout.html',
  styleUrl: './instructor-layout.scss'
})
export class InstructorLayout implements OnInit, OnDestroy {
  private authService = inject(Authservice);
  router = inject(Router); // Expose for template
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  private lectureService = inject(InstructorLectureService);
  isAuthenticated = signal(false);
  user = signal<userDto | any>(null);
  courseId = signal<number | null>(null);
  private routerSubscription?: Subscription;
  private lastLoadedCourseId: number | null = null; // Track to prevent duplicate calls
  
  // Lectures dropdown
  lectures = signal<LectureDTO[]>([]);
  showLecturesDropdown = signal<boolean>(false);
  showCreateLectureModal = signal<boolean>(false);
  loadingLectures = signal<boolean>(false);
  
  // Create lecture form
  newLectureTitle = signal<string>('');
  newLectureDescription = signal<string>('');
  creatingLecture = signal<boolean>(false);

  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();

    if (token) {
      this.isAuthenticated.set(true)
      this.loadUserProfile();
    }

    // Lấy courseId từ URL khi route thay đổi
    this.updateCourseIdFromUrl();
    
    // Auto-expand lectures dropdown if on lecture page (initial load)
    if (this.router.url.includes('/lectures/')) {
      setTimeout(() => {
        this.showLecturesDropdown.set(true);
        const collapseElement = document.getElementById('lecturesCollapse');
        if (collapseElement) {
          collapseElement.classList.add('show');
        }
      }, 100);
    }
    
    // Subscribe để cập nhật courseId khi route thay đổi
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCourseIdFromUrl();
        // Auto-expand lectures dropdown if on lecture page
        if (this.router.url.includes('/lectures/')) {
          setTimeout(() => {
            this.showLecturesDropdown.set(true);
            const collapseElement = document.getElementById('lecturesCollapse');
            if (collapseElement) {
              collapseElement.classList.add('show');
            }
          }, 100);
        } else {
          // Close if navigating away from lecture page
          this.showLecturesDropdown.set(false);
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateCourseIdFromUrl() {
    // Lấy courseId từ URL: /instructor/courses/:courseId/...
    const url = this.router.url;
    const match = url.match(/\/instructor\/courses\/(\d+)/);
    const previousCourseId = this.courseId();
    let newCourseId: number | null = null;
    
    if (match && match[1]) {
      newCourseId = +match[1];
    } else {
      // Fallback: thử lấy từ child route params
      let route = this.route.firstChild;
      while (route) {
        const courseId = route.snapshot.params['courseId'];
        if (courseId) {
          newCourseId = +courseId;
          break;
        }
        route = route.firstChild;
      }
    }
    
    if (newCourseId !== null) {
      this.courseId.set(newCourseId);
      // Only reload if courseId changed and hasn't been loaded yet
      if (previousCourseId !== newCourseId && this.lastLoadedCourseId !== newCourseId) {
        this.loadLectures();
      }
    }
  }
  
  loadLectures(): void {
    const courseId = this.courseId();
    if (!courseId) return;
    
    // Prevent duplicate calls
    if (this.lastLoadedCourseId === courseId && this.lectures().length > 0) {
      console.log('Lectures already loaded for course:', courseId);
      return;
    }
    
    this.loadingLectures.set(true);
    console.log('Loading lectures for course:', courseId);
    
    this.lectureService.getLecturesByCourse(courseId).subscribe({
      next: (response) => {
        console.log('Lectures API response:', response);
        let lectures: LectureDTO[] = [];
        
        if (response.success && response.data) {
          // Handle both array and object response
          if (Array.isArray(response.data)) {
            lectures = response.data;
            console.log('Data is array, length:', lectures.length);
          } else if (typeof response.data === 'object' && response.data !== null) {
            // If it's an object, try to extract array from it
            if (Array.isArray((response.data as any).items)) {
              lectures = (response.data as any).items;
              console.log('Data is object with items, length:', lectures.length);
            } else if (Array.isArray((response.data as any))) {
              lectures = response.data as any;
              console.log('Data is object but is array, length:', lectures.length);
            } else {
              console.warn('Data is object but not array or has items:', response.data);
              lectures = [];
            }
          } else {
            console.warn('Response data is not array or object:', response.data);
            lectures = [];
          }
        } else {
          console.warn('Response not successful or no data:', response);
          lectures = [];
        }
        
        // Always ensure lectures is an array
        if (!Array.isArray(lectures)) {
          console.error('Lectures is not an array, converting:', lectures);
          lectures = [];
        }
        
        console.log('Setting lectures (final):', lectures);
        this.lectures.set([...lectures]); // Use spread to ensure change detection
        this.lastLoadedCourseId = courseId;
        console.log('Lectures after set:', this.lectures());
        console.log('Lectures count:', this.lectures().length);
        console.log('Is array?', Array.isArray(this.lectures()));
        this.loadingLectures.set(false);
      },
      error: (error) => {
        console.error('Error loading lectures:', error);
        this.lectures.set([]);
        this.loadingLectures.set(false);
      }
    });
  }
  
  toggleLecturesDropdown(): void {
    const newState = !this.showLecturesDropdown();
    this.showLecturesDropdown.set(newState);
    
    // Sync with Bootstrap collapse
    const collapseElement = document.getElementById('lecturesCollapse');
    if (collapseElement) {
      if (newState) {
        collapseElement.classList.add('show');
        // Load lectures if not already loaded or if courseId changed
        const courseId = this.courseId();
        if (courseId && (this.lectures().length === 0 || this.lastLoadedCourseId !== courseId)) {
          this.loadLectures();
        }
      } else {
        collapseElement.classList.remove('show');
      }
    }
  }
  
  openCreateLectureModal(): void {
    this.showCreateLectureModal.set(true);
    this.newLectureTitle.set('');
    this.newLectureDescription.set('');
    this.showLecturesDropdown.set(false);
  }
  
  closeCreateLectureModal(): void {
    this.showCreateLectureModal.set(false);
    this.newLectureTitle.set('');
    this.newLectureDescription.set('');
  }
  
  createLecture(): void {
    const courseId = this.courseId();
    if (!courseId || !this.newLectureTitle().trim()) {
      this.toastr.warning('Please enter a lecture title', 'Validation');
      return;
    }
    
    this.creatingLecture.set(true);
    const createDto: CreateLectureDto = {
      courseId: courseId,
      title: this.newLectureTitle().trim(),
      description: this.newLectureDescription().trim() || ''
    };
    
    this.lectureService.createLecture(createDto).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.toastr.success('Lecture created successfully', 'Success');
          this.closeCreateLectureModal();
          // Reset last loaded course ID to force reload
          this.lastLoadedCourseId = null;
          this.loadLectures();
          // Navigate to the new lecture
          this.router.navigate(['/instructor/courses', courseId, 'lectures', response.data.lectureId]);
        } else {
          this.toastr.error(response.message || 'Failed to create lecture', 'Error');
        }
        this.creatingLecture.set(false);
      },
      error: (error) => {
        console.error('Error creating lecture:', error);
        this.toastr.error('Failed to create lecture', 'Error');
        this.creatingLecture.set(false);
      }
    });
  }
  
  navigateToLecture(lectureId: number): void {
    const courseId = this.courseId();
    if (courseId) {
      this.showLecturesDropdown.set(false);
      this.router.navigate(['/instructor/courses', courseId, 'lectures', lectureId]);
    }
  }

  loadUserProfile() {
    this.genericservice.get('api/profile/me').subscribe({
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
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.router.navigate(['/auth/signin']);
  }
}

