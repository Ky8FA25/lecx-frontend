import { Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { catchError, Observable, throwError } from 'rxjs';
import { CourseDto } from '../models/course-dto.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private genericService: GenericServices) { }
    
  /**
   * Write code on Method
   *
   * @return response()
   */
  getAll(pageIndex: number, pageSize: number): Observable<any> {
  return this.genericService.get(`api/courses/all?pageIndex=${pageIndex}&pageSize=${pageSize}`)
    .pipe(catchError(this.errorHandler));
}
    
  /**
   * Write code on Method
   *
   * @return response()
   */
  create(course : CourseDto): Observable<any> {
  
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
  update(id:number, course:CourseDto): Observable<any> {
  
    return this.genericService.put('/api/courses/' + id, JSON.stringify(course))
 
    .pipe( 
      catchError(this.errorHandler)
    )
  }
       
  /**
   * Write code on Method
   *
   * @return response()
   */
  delete(id:number){
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
  errorHandler(error:any) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
 }
}
