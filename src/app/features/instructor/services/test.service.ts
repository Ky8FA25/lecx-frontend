import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';
import { TestDTO, CreateTestDto, UpdateTestDto, TestScoreDTO } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private genericService = inject(GenericServices);

  // Test APIs
  getTestsByCourse(courseId: number): Observable<ApiResponse<TestDTO[]>> {
    return this.genericService.get<ApiResponse<TestDTO[]>>(`api/tests?courseId=${courseId}`);
  }

  getTestById(testId: number): Observable<ApiResponse<TestDTO>> {
    return this.genericService.get<ApiResponse<TestDTO>>(`api/tests/${testId}`);
  }

  createTest(test: CreateTestDto): Observable<ApiResponse<TestDTO>> {
    return this.genericService.post<ApiResponse<TestDTO>>('api/tests', test);
  }

  updateTest(testId: number, test: UpdateTestDto): Observable<ApiResponse<TestDTO>> {
    return this.genericService.put<ApiResponse<TestDTO>>(`api/tests/${testId}`, test);
  }

  deleteTest(testId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/tests/${testId}`);
  }

  // Test Score APIs
  getTestScores(testId: number, pageIndex: number = 1, pageSize: number = 20): Observable<ApiResponse<PaginatedResponse<TestScoreDTO>>> {
    return this.genericService.get<ApiResponse<PaginatedResponse<TestScoreDTO>>>(
      `api/tests/${testId}/scores?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
  }

  deleteTestScore(testScoreId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/tests/scores/${testScoreId}`);
  }
}

