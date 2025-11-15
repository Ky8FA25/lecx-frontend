import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute, RouterLinkActive, NavigationEnd } from "@angular/router";
import { Authservice } from '../../core/services/authservice';
import { GenericServices } from '../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';
import { userDto } from '../../features/user/models/userDto';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-instructor-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './instructor-layout.html',
  styleUrl: './instructor-layout.scss'
})
export class InstructorLayout implements OnInit, OnDestroy {
  private authService = inject(Authservice);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  isAuthenticated = signal(false);
  user = signal<userDto | any>(null);
  courseId = signal<number | null>(null);
  private routerSubscription?: Subscription;

  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();

    if (token) {
      this.isAuthenticated.set(true)
      this.loadUserProfile();
    }

    // Lấy courseId từ URL khi route thay đổi
    this.updateCourseIdFromUrl();
    
    // Subscribe để cập nhật courseId khi route thay đổi
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCourseIdFromUrl();
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
    if (match && match[1]) {
      this.courseId.set(+match[1]);
    } else {
      // Fallback: thử lấy từ child route params
      let route = this.route.firstChild;
      while (route) {
        const courseId = route.snapshot.params['courseId'];
        if (courseId) {
          this.courseId.set(+courseId);
          break;
        }
        route = route.firstChild;
      }
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

