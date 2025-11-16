import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/generic-response-class';
import { LectureDTO, CreateLectureDto, UpdateLectureDto, CreateLectureFileDto, LectureFileDTO } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class InstructorLectureService {
  private genericService = inject(GenericServices);

  // Lecture APIs
  getLectureById(lectureId: number): Observable<ApiResponse<LectureDTO>> {
    return this.genericService.get<ApiResponse<LectureDTO>>(`api/lectures/${lectureId}`);
  }

  getLecturesByCourse(courseId: number): Observable<ApiResponse<LectureDTO[]>> {
    return this.genericService.get<ApiResponse<LectureDTO[]>>(`api/lectures/course?courseId=${courseId}`);
  }

  createLecture(lecture: CreateLectureDto): Observable<ApiResponse<LectureDTO>> {
    return this.genericService.post<ApiResponse<LectureDTO>>('api/lectures', lecture);
  }

  updateLecture(lecture: UpdateLectureDto): Observable<ApiResponse<LectureDTO>> {
    return this.genericService.patch<ApiResponse<LectureDTO>>('api/lectures', lecture);
  }

  deleteLecture(lectureId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/lectures/${lectureId}`);
  }

  // Lecture File APIs
  createLectureFile(file: CreateLectureFileDto): Observable<ApiResponse<LectureFileDTO>> {
    return this.genericService.post<ApiResponse<LectureFileDTO>>('api/lectures/file', file);
  }

  updateLectureFile(fileId: number, fileName?: string | null, filePath?: string | null): Observable<ApiResponse<LectureFileDTO>> {
    return this.genericService.patch<ApiResponse<LectureFileDTO>>('api/lectures/file', {
      fileId,
      fileName,
      filePath
    });
  }

  deleteLectureFile(fileId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/lectures/file/${fileId}`);
  }
}

