import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import "../../../assets/css/templatemo-topic-listing.css";
import { Authservice } from '../../core/services/authservice';
import { GenericServices } from '../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';
import { userDto } from '../../features/user/models/userDto';
import { CommonModule } from '@angular/common';
import { Role } from '../../core/enums/enums';

@Component({
  selector: 'app-mainlayout',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class Mainlayout implements OnInit {

  private authService = inject(Authservice);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  isAuthenticated = signal(false);
  user = signal<userDto | any>(null);

  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();

    if (token) {
      this.isAuthenticated.set(true)
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    this.genericservice.get('api/profile/me').subscribe({
      next: (data) => {
        this.user.set(data);
        console.log('✅ User profile loaded:', this.user);
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

  /**
   * Lấy route "My Courses" dựa trên role của user
   * - Instructor/Admin: /instructor/courses
   * - Student: /student/my-courses
   */
  getMyCoursesRoute(): string {
    const role = this.authService.getRole();
    if (role === Role.Instructor || role === Role.Admin) {
      return '/instructor/courses';
    }
    return '/student/my-courses';
  }
  
}


