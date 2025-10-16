import { Component, inject, OnInit } from '@angular/core';
import { Authservice } from '../../../../core/services/authservice';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericServices } from '../../../../core/services/GenericServices';

@Component({
  selector: 'app-userprofile',
  imports: [],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.scss'
})
export class Userprofile implements OnInit {
  ngOnInit(): void {
    debugger;
   const token = this.authService.getAccessToken();
    this.isAuthenticated = !!token;
    if (this.isAuthenticated) {
      this.loadUserProfile();
    }
  }

  private authService = inject(Authservice);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);

  isAuthenticated = false;
  user: any = null;
  loading = true;

 
  ngAfterContentInit() {
    
  }

  loadUserProfile() {
    debugger;
    this.genericservice.get('api/profile/me').subscribe({
      next: (data) => {
        debugger;
        this.user = data;
        console.log('✅ User profile loaded:', this.user);
      },
      error: (err) => {
        console.error('❌ Failed to load profile:', err);
        this.toastr.error('Failed to load user profile', 'Error');
      }
    });
  }
  

}
