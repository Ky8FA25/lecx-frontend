import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Authservice } from '../../../../core/services/authservice';
import { ToastrService } from 'ngx-toastr';
import { GenericServices } from '../../../../core/services/GenericServices';
import { Subscription } from 'rxjs';
import { userDto } from '../../models/userDto';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit, OnDestroy{
private authService = inject(Authservice);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  private subscriptions = new Subscription(); 
  isAuthenticated = false;
  user = signal<userDto | any>(null);
  loading = true;

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    this.isAuthenticated = !!token;
    if (this.isAuthenticated) {
      this.loadUserProfile();
    }
  }
  loadUserProfile() {
    const loadtUser = this.genericservice.get('api/profile/me').subscribe({
      next: (data : any) => {
        this.user.set(data);
        console.log('✅ User profile loaded:', this.user());
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.toastr.error('Failed to load user profile', 'Error');
      }
    });
    this.subscriptions.add(loadtUser);
  }

   ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
