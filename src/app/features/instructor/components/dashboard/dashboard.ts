import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { InstructorService } from '../../services/instructor.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { DashboardViewModel } from '../../models/instructor.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [SharedModule, RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class InstructorDashboard implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instructorService = inject(InstructorService);
  private genericService = inject(GenericServices);

  courseId = signal<number | null>(null);
  dashboardData = signal<DashboardViewModel | null>(null);
  loading = signal(false);

  ngOnInit() {
    // Lấy courseId từ route params (URL: /instructor/courses/:courseId/dashboard)
    this.route.params.subscribe(params => {
      const courseId = params['courseId'];
      if (courseId) {
        this.courseId.set(+courseId);
        this.loadDashboard(+courseId);
      } else {
        this.genericService.showError('Course ID is required');
        this.router.navigate(['/instructor/courses']);
      }
    });
  }

  loadDashboard(courseId: number) {
    this.loading.set(true);
    console.log('📊 Loading dashboard for course:', courseId);
    
    this.instructorService.getDashboard(courseId).subscribe({
      next: (response) => {
        console.log('✅ Dashboard API Response:', response);
        
        if (response.success && response.data) {
          console.log('📈 Dashboard data:', response.data);
          this.dashboardData.set(response.data);
        } else {
          console.warn('⚠️ Dashboard response:', response);
          this.genericService.showError(response.message || 'Failed to load dashboard');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading dashboard:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.genericService.showError(err.error?.message || 'Failed to load dashboard data');
        this.loading.set(false);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

