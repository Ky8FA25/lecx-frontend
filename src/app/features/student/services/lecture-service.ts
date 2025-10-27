import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { LectureDTO } from '../models/lecture';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';

@Injectable({
  providedIn: 'root'
})
export class LectureService {
  private genericService = inject(GenericServices);
  private apiUrl = 'api/lectures/course';
  getLecturesByCourse(courseId: number): Observable<ApiResponse<PaginatedResponse<LectureDTO>>> {
    return this.genericService.get<ApiResponse<PaginatedResponse<LectureDTO>>>(
      `${this.apiUrl}?courseId=${courseId}&pageIndex=1&pageSize=10`
    );
  }
}
