import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { catchError, Observable, throwError } from 'rxjs';
import { CourseDto } from '../models/course-dto.model';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private genericService: GenericServices) { }

  payloads: any;

  /**
   * Get filtered courses with pagination (single API for all cases)
   * All params are optional - works with or without filters
   */
  getFiltered(filters: {
    keyword?: string;
    categoryId?: number;
    level?: number;
    status?: number;
    pageIndex?: number;
    pageSize?: number;
  }): Observable<any> {
    return this.genericService.getWithFilter('/api/courses/filter', filters)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Write code on Method
   *
   * @return response()
   */
  create(course: CourseDto): Observable<any> {

    return this.genericService.post('/posts/', JSON.stringify(course))

      .pipe(
        catchError(this.errorHandler)
      )
  }

  /**
   * Write code on Method
   *
   * @return response()
   */
  find(id: string): Observable<CourseDto> {
    return this.genericService.get<CourseDto>(`api/courses/${id}`).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Write code on Method
   *
   * @return response()
   */
  update(id: number, course: CourseDto): Observable<any> {

    return this.genericService.put('api/courses/' + id, JSON.stringify(course))

      .pipe(
        catchError(this.errorHandler)
      )
  }

  /**
   * Write code on Method
   *
   * @return response()
   */
  delete(id: number) {
    return this.genericService.delete('/api/courses//' + id)

      .pipe(
        catchError(this.errorHandler)
      )
  }

  /** 
   * Write code on Method
   *
   * @return response()
   */
  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
  isEnrolled(courseId: string): Observable<{ success: boolean; data: boolean }> {
    return this.genericService.get<{ success: boolean; data: boolean }>(
      `api/student-courses/check-exist?courseId=${courseId}`
    );
  }

  buyCourse(payloads : any): Observable<{ success: boolean; message: string }> {
    return this.genericService.post<{ success: boolean; message: string }>(
      `api/payments/create`,
      { courseId: payloads.courseId,
        returnUrl: payloads.returnUrl,
        cancelUrl: payloads.cancelUrl 
       }
    );
  }
}
