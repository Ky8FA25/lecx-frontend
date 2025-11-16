import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { PaymentResponse, PaymentDTO } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private genericService = inject(GenericServices);

  /**
   * Get payments by course ID
   * GET /api/payments/course/{CourseId}
   */
  getPaymentsByCourse(courseId: number): Observable<PaymentResponse> {
    return this.genericService.get<PaymentResponse>(`api/payments/course/${courseId}`);
  }
}

