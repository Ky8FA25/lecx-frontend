import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';
import { DashboardViewModel, CourseModel, CreateCourseDto, UpdateCourseDto } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private genericService = inject(GenericServices);

  // Dashboard APIs
  getDashboard(courseId: number): Observable<ApiResponse<DashboardViewModel>> {
    return this.genericService.get<ApiResponse<DashboardViewModel>>(
      `api/instructor/courses/${courseId}/dashboard`
    );
  }

  getCourseStudents(courseId: number, pageIndex: number = 1, pageSize: number = 10): Observable<ApiResponse<PaginatedResponse<any>>> {
    return this.genericService.get<ApiResponse<PaginatedResponse<any>>>(
      `api/instructor/courses/${courseId}/students?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
  }

  // Course Management APIs
  getMyCourses(categoryId?: number, level?: number, pageIndex: number = 1, pageSize: number = 10): Observable<ApiResponse<PaginatedResponse<CourseModel>>> {
    let url = `api/courses/all?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (level !== undefined) url += `&level=${level}`;
    return this.genericService.get<ApiResponse<PaginatedResponse<CourseModel>>>(url);
  }

  createCourse(course: CreateCourseDto): Observable<ApiResponse<CourseModel>> {
    return this.genericService.post<ApiResponse<CourseModel>>(
      'api/courses/create',
      { createCourseDto: course }
    );
  }

  updateCourse(courseId: number, course: UpdateCourseDto): Observable<ApiResponse<CourseModel>> {
    return this.genericService.put<ApiResponse<CourseModel>>(
      `api/courses/${courseId}`,
      { updateCourseDto: course }
    );
  }

  deleteCourse(courseId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/courses/${courseId}`);
  }

  setCourseStatus(courseId: number, status: number): Observable<ApiResponse<any>> {
    return this.genericService.put<ApiResponse<any>>(
      `api/courses/${courseId}/status`,
      { status }
    );
  }

  getCourseById(courseId: number): Observable<ApiResponse<CourseModel>> {
    return this.genericService.get<ApiResponse<CourseModel>>(`api/courses/${courseId}`);
  }
}

