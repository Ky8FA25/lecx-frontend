import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';
import { CommentDTO, CreateCommentDto } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private genericService = inject(GenericServices);

  // Comment APIs
  getCommentsByLecture(lectureId: number, parentCmtId: number | null = null, pageIndex: number = 1, pageSize: number = 10): Observable<ApiResponse<PaginatedResponse<CommentDTO>>> {
    let url = `api/comments/lecture/${lectureId}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (parentCmtId !== null) {
      url += `&parentCmtId=${parentCmtId}`;
    }
    return this.genericService.get<ApiResponse<PaginatedResponse<CommentDTO>>>(url);
  }

  getCommentById(commentId: number): Observable<ApiResponse<CommentDTO>> {
    return this.genericService.get<ApiResponse<CommentDTO>>(`api/comments/${commentId}`);
  }

  createComment(comment: CreateCommentDto): Observable<ApiResponse<CommentDTO>> {
    return this.genericService.post<ApiResponse<CommentDTO>>('api/comments', comment);
  }

  updateComment(commentId: number, content: string): Observable<ApiResponse<CommentDTO>> {
    return this.genericService.put<ApiResponse<CommentDTO>>(`api/comments/${commentId}`, { content });
  }

  deleteComment(commentId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/comments/${commentId}`);
  }
}

