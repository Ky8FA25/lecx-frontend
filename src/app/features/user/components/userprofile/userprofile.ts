import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { Authservice } from '../../../../core/services/authservice';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericServices } from '../../../../core/services/GenericServices';
import { CommonModule } from '@angular/common';
import { userDto } from '../../models/userDto';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.scss'
})
export class Userprofile implements OnInit {

  private authService = inject(Authservice);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);

  isAuthenticated = false;
  user = signal<userDto | any>(null);
  loading = true;

  ngOnInit(): void {
    debugger;
    const token = this.authService.getAccessToken();
    this.isAuthenticated = !!token;
    if (this.isAuthenticated) {
      this.loadUserProfile();
    }
  }
  loadUserProfile() {
    debugger;
    this.genericservice.get('api/profile/me').subscribe({
      next: (data) => {
        debugger;
        this.user.set(data);
        console.log('✅ User profile loaded:', this.user);
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.toastr.error('Failed to load user profile', 'Error');
      }
    });
  }
}
