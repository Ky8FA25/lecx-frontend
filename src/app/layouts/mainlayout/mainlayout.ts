import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import "../../../assets/css/templatemo-topic-listing.css";
import { Authservice } from '../../core/services/authservice';
import { SlicePipe } from '@angular/common';
import { GenericServices } from '../../core/services/GenericServices';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mainlayout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './mainlayout.html',
  styleUrl: './mainlayout.scss'
})
export class Mainlayout implements OnInit {

  private authService = inject(Authservice);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private genericservice = inject(GenericServices);
  private http = inject(HttpClient);

  isAuthenticated = false;
  user: any = null;

  constructor() { }

  ngOnInit() {
    const token = this.authService.getAccessToken();
    this.isAuthenticated = !!token;

    if (this.isAuthenticated) {
     // this.loadUserProfile();
    }
  }

  loadUserProfile() {
    this.genericservice.get('api/profile/me').subscribe({
      next: (data) => {
        this.user = data;
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
    this.isAuthenticated = false;
    this.user = null;
    this.router.navigate(['/auth/signin']);
  }
  
}
