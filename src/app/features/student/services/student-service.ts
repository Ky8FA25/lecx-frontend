import { Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { StudentCourse } from '../models/studentCourse';
import { Observable } from 'rxjs';
import { CategoryDto } from '../../home/models/categoryDto';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
constructor(private genericService: GenericServices) {}

  getStudentCourseDetailById(url : string, studentCourseId: number): Observable<StudentCourse> {
    return this.genericService.get<StudentCourse>(`${url}/${studentCourseId}`);
  }
  getCategoryDetailById(url : string,id : Number): Observable<CategoryDto> {
    return this.genericService.get<CategoryDto>(`${url}/${id}`);
  }
}
