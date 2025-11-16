import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';
import { AssignmentDTO, CreateAssignmentDto, UpdateAssignmentDto, SubmissionDTO, ScoreAssignmentDto, AssignmentScoreDTO, CreateAssignmentScoreDto, UpdateAssignmentScoreDto } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private genericService = inject(GenericServices);

  // Assignment APIs
  getAssignmentsByCourse(courseId: number): Observable<ApiResponse<AssignmentDTO[]>> {
    return this.genericService.get<ApiResponse<AssignmentDTO[]>>(`api/assignments/filter?courseId=${courseId}`);
  }

  getAssignmentById(assignmentId: number): Observable<ApiResponse<AssignmentDTO>> {
    return this.genericService.get<ApiResponse<AssignmentDTO>>(`api/assignments/${assignmentId}`);
  }

  createAssignment(assignment: CreateAssignmentDto): Observable<ApiResponse<AssignmentDTO>> {
    return this.genericService.post<ApiResponse<AssignmentDTO>>('api/assignments', assignment);
  }

  updateAssignment(assignmentId: number, assignment: UpdateAssignmentDto): Observable<ApiResponse<AssignmentDTO>> {
    return this.genericService.put<ApiResponse<AssignmentDTO>>(`api/assignments/${assignmentId}`, assignment);
  }

  deleteAssignment(assignmentId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/assignments/${assignmentId}`);
  }

  // Submission APIs
  getSubmissionsByAssignment(assignmentId: number, pageIndex: number = 1, pageSize: number = 20): Observable<ApiResponse<PaginatedResponse<SubmissionDTO>>> {
    return this.genericService.get<ApiResponse<PaginatedResponse<SubmissionDTO>>>(
      `api/submissions/assignment/${assignmentId}?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
  }

  scoreAssignment(score: ScoreAssignmentDto): Observable<ApiResponse<any>> {
    return this.genericService.post<ApiResponse<any>>('api/assignments/score', score);
  }

  // Assignment Score APIs
  getAssignmentScore(assignmentId: number, studentId: string): Observable<ApiResponse<AssignmentScoreDTO>> {
    return this.genericService.get<ApiResponse<AssignmentScoreDTO>>(
      `api/assignment-scores/assignment/${assignmentId}/student/${studentId}`
    );
  }

  createAssignmentScore(score: CreateAssignmentScoreDto): Observable<ApiResponse<AssignmentScoreDTO>> {
    return this.genericService.post<ApiResponse<AssignmentScoreDTO>>('api/assignment-scores', score);
  }

  updateAssignmentScore(assignmentScoreId: number, score: UpdateAssignmentScoreDto): Observable<ApiResponse<AssignmentScoreDTO>> {
    return this.genericService.put<ApiResponse<AssignmentScoreDTO>>(
      `api/assignment-scores/${assignmentScoreId}`,
      score
    );
  }
}

