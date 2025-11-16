import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/generic-response-class';
import { CourseMaterialDTO, CreateCourseMaterialDto, UpdateCourseMaterialDto } from '../models/instructor.models';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private genericService = inject(GenericServices);

  // Material APIs
  getMaterialsByCourse(courseId: number): Observable<ApiResponse<CourseMaterialDTO[]>> {
    return this.genericService.get<ApiResponse<CourseMaterialDTO[]>>(`api/course-materials/course/${courseId}`);
  }

  getMaterialById(materialId: number): Observable<ApiResponse<CourseMaterialDTO>> {
    return this.genericService.get<ApiResponse<CourseMaterialDTO>>(`api/course-materials/${materialId}`);
  }

  createMaterial(material: CreateCourseMaterialDto): Observable<ApiResponse<CourseMaterialDTO>> {
    return this.genericService.post<ApiResponse<CourseMaterialDTO>>('api/course-materials', material);
  }

  updateMaterial(material: UpdateCourseMaterialDto): Observable<ApiResponse<CourseMaterialDTO>> {
    // API uses PATCH method according to readme_be.md
    return this.genericService.patch<ApiResponse<CourseMaterialDTO>>('api/course-materials', material);
  }

  deleteMaterial(materialId: number): Observable<ApiResponse<any>> {
    return this.genericService.delete<ApiResponse<any>>(`api/course-materials/${materialId}`);
  }
}

