import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericServices } from '../../../core/services/GenericServices';
import { GetAssignmentsByCourseRequest, GetAssignmentsByCourseResponse } from '../models/getAssignmentsByCourseRequest';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private genericService = inject(GenericServices);

  getAssignmentsByCourse(url: string, req: GetAssignmentsByCourseRequest): Observable<GetAssignmentsByCourseResponse> {
    // ✅ Truyền object filter đúng format hàm getWithFilter()
    const filters = {
      PageIndex: req.pageIndex,
      PageSize: req.pageSize,
      SearchWord: req.searchWord,
      CourseId: req.courseId,
      DateSearch: req.dateSearch
    };

    return this.genericService.getWithFilter(url, filters);
  }

}
