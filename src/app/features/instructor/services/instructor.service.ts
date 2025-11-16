import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../../core/models/generic-response-class';
import { DashboardViewModel, CourseModel, CreateCourseDto, UpdateCourseDto } from '../models/instructor.models';
import { Authservice } from '../../../core/services/authservice';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private genericService = inject(GenericServices);
  private authService = inject(Authservice);

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
    // Lấy instructorId từ user data hoặc JWT token
    const instructorId = this.getInstructorId();
    
    if (!instructorId) {
      console.error('❌ Instructor ID not found');
      throw new Error('Instructor ID not found. Please login again.');
    }
    
    console.log('🔍 Getting courses for instructor:', instructorId);
    
    let url = `api/courses/instructor/${instructorId}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (level !== undefined) url += `&level=${level}`;
    
    console.log('📡 API URL:', url);
    
    return this.genericService.get<ApiResponse<PaginatedResponse<CourseModel>>>(url);
  }

  /**
   * Filter courses using GET /api/courses/filter
   * Query Parameters: keyword, categoryId, level, status, pageIndex, pageSize
   */
  filterCourses(keyword?: string | null, categoryId?: number | null, level?: number | null, status?: number | null, pageIndex: number = 1, pageSize: number = 10): Observable<PaginatedResponse<CourseModel>> {
    let url = `api/courses/filter?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (level !== null && level !== undefined) url += `&level=${level}`;
    if (status !== null && status !== undefined) url += `&status=${status}`;
    
    console.log('📡 Filter courses API URL:', url);
    
    // API filter returns PaginatedResponse directly (not wrapped in ApiResponse)
    return this.genericService.get<PaginatedResponse<CourseModel>>(url);
  }

  /**
   * Lấy instructorId từ localStorage user data hoặc decode JWT token
   * Public method để các component có thể sử dụng
   */
  getInstructorId(): string | null {
    // Thử lấy từ localStorage user data
    const userDataStr = localStorage.getItem('user');
    console.log('🔍 Checking localStorage user data:', userDataStr);
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log('📋 Parsed user data:', userData);
        if (userData.id) {
          console.log('✅ Found instructorId from localStorage:', userData.id);
          return userData.id;
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
      }
    }
    
    // Nếu không có trong localStorage, thử decode JWT token
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔐 JWT payload:', payload);
        // JWT có thể chứa user ID trong claims như 'sub', 'nameid', 'userId', 'id'
        const userId = payload.sub || payload.nameid || payload.userId || payload.id;
        if (userId) {
          console.log('✅ Found instructorId from JWT:', userId);
          return userId;
        }
      } catch (e) {
        console.error('❌ Error decoding JWT token:', e);
      }
    }
    
    console.warn('⚠️ Instructor ID not found in localStorage or JWT');
    return null;
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

