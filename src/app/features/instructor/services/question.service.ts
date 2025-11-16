import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';
import { QuestionDTO, CreateQuestionDto, UpdateQuestionDto, CreateQuestionsListDto } from '../models/instructor.models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private genericService = inject(GenericServices);

  // Question APIs
  getQuestionsByTest(testId: number, pageIndex: number = 1, pageSize: number = 20): Observable<ApiResponse<PaginatedResponse<QuestionDTO>>> {
    return this.genericService.get<ApiResponse<PaginatedResponse<QuestionDTO>>>(`api/tests/${testId}/questions?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  }

  getQuestionById(questionId: number): Observable<ApiResponse<QuestionDTO>> {
    return this.genericService.get<ApiResponse<QuestionDTO>>(`api/tests/questions/${questionId}`);
  }

  createQuestion(question: CreateQuestionDto): Observable<ApiResponse<QuestionDTO>> {
    return this.genericService.post<ApiResponse<QuestionDTO>>('api/tests/questions', question);
  }

  createQuestionsList(questions: CreateQuestionsListDto): Observable<ApiResponse<QuestionDTO[]>> {
    return this.genericService.post<ApiResponse<QuestionDTO[]>>('api/tests/questions/lists', questions);
  }

  updateQuestion(question: UpdateQuestionDto): Observable<ApiResponse<QuestionDTO>> {
    return this.genericService.put<ApiResponse<QuestionDTO>>('api/tests/questions', question);
  }

  deleteQuestion(questionId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/tests/questions/${questionId}`);
  }

  // Import Questions
  importFromExcel(testId: number, file: File, skipFirstLine: boolean = false): Observable<ApiResponse<QuestionDTO[]>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', testId.toString());
    formData.append('skipFirstLine', skipFirstLine.toString());
    
    return this.genericService.post<ApiResponse<QuestionDTO[]>>('api/tests/questions/import-excel', formData);
  }

  importFromCSV(testId: number, file: File, skipFirstLine: boolean = false): Observable<ApiResponse<QuestionDTO[]>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', testId.toString());
    formData.append('skipFirstLine', skipFirstLine.toString());
    
    return this.genericService.post<ApiResponse<QuestionDTO[]>>('api/tests/questions/import-csv', formData);
  }
}

