import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref, ActivatedRoute } from "@angular/router";
import { Authservice } from '../../core/services/authservice';
import { GenericServices } from '../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';
import { userDto } from '../../features/user/models/userDto';

@Component({
  selector: 'app-course-layout',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './course-layout.html',
  styleUrl: './course-layout.scss'
})
export class CourseLayout {
private authService = inject(Authservice);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  isAuthenticated = signal(false);
  user = signal<userDto | any>(null);
  courseID: string | undefined; 
  private route = inject(ActivatedRoute);
  
  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();
    this.courseID = this.route.snapshot.paramMap.get('courseID') ?? '';
    
    if (token) {
      this.isAuthenticated.set(true)
      this.loadUserProfile();
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
