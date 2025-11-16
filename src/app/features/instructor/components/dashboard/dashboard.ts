import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { InstructorService } from '../../services/instructor.service';
import { PaymentService } from '../../services/payment.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { DashboardViewModel, PaymentDTO } from '../../models/instructor.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class InstructorDashboard implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instructorService = inject(InstructorService);
  private paymentService = inject(PaymentService);
  private genericService = inject(GenericServices);

  courseId = signal<number | null>(null);
  dashboardData = signal<DashboardViewModel | null>(null);
  loading = signal(false);
  totalEarningsMonth = signal<number>(0);
  totalEarningsWeek = signal<number>(0);

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
    
    // Load dashboard data and payments in parallel
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
      },
      error: (err) => {
        console.error('❌ Error loading dashboard:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.genericService.showError(err.error?.message || 'Failed to load dashboard data');
      }
    });

    // Load payments to calculate earnings
    this.loadPaymentsAndCalculateEarnings(courseId);
  }

  loadPaymentsAndCalculateEarnings(courseId: number) {
    console.log('💰 Loading payments for course:', courseId);
    
    this.paymentService.getPaymentsByCourse(courseId).subscribe({
      next: (response) => {
        console.log('✅ Payments API Response:', response);
        
        let payments: PaymentDTO[] = [];
        
        // Handle different response formats
        if (response) {
          // Format 1: { payments: [...] }
          if (response.payments && Array.isArray(response.payments)) {
            payments = response.payments;
          }
          // Format 2: Direct array
          else if (Array.isArray(response)) {
            payments = response;
          }
          // Format 3: { success: true, data: { payments: [...] } }
          else if ((response as any).success && (response as any).data) {
            const data = (response as any).data;
            if (data.payments && Array.isArray(data.payments)) {
              payments = data.payments;
            } else if (Array.isArray(data)) {
              payments = data;
            }
          }
        }

        console.log('📋 Parsed payments:', payments);
        
        // Calculate earnings
        const { monthEarnings, weekEarnings } = this.calculateEarnings(payments);
        
        this.totalEarningsMonth.set(monthEarnings);
        this.totalEarningsWeek.set(weekEarnings);
        
        console.log('💰 Earnings calculated:', {
          month: monthEarnings,
          week: weekEarnings
        });

        // Update dashboard data if it exists
        const currentData = this.dashboardData();
        if (currentData) {
          this.dashboardData.set({
            ...currentData,
            earningMonth: monthEarnings,
            earningDay: weekEarnings
          });
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading payments:', err);
        // Set earnings to 0 on error
        this.totalEarningsMonth.set(0);
        this.totalEarningsWeek.set(0);
        this.loading.set(false);
      }
    });
  }

  /**
   * Calculate earnings from payments
   * Only count payments with status "Completed"
   */
  private calculateEarnings(payments: PaymentDTO[]): { monthEarnings: number; weekEarnings: number } {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    let monthEarnings = 0;
    let weekEarnings = 0;

    payments.forEach(payment => {
      // Only count completed payments
      if (payment.status !== 'Pending' && payment.status !== 'Completed') {
        return;
      }

      const paymentDate = new Date(payment.paymentDate);
      const amount = payment.amount || 0;

      // Check if payment is in current month
      if (paymentDate >= startOfMonth) {
        monthEarnings += amount;
      }

      // Check if payment is in current week
      if (paymentDate >= startOfWeek) {
        weekEarnings += amount;
      }
    });

    return {
      monthEarnings: Math.round(monthEarnings),
      weekEarnings: Math.round(weekEarnings)
    };
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

