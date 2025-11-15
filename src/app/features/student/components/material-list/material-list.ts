import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { ApiResponse } from '../../../../core/models/generic-response-class';
import { CourseMaterialDTO } from '../../../instructor/models/instructor.models';

@Component({
  selector: 'app-material-list',
  imports: [CommonModule, SharedModule],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialList implements OnInit, OnDestroy {
  materials = signal<CourseMaterialDTO[]>([]);
  loading = signal<boolean>(false);
  courseID: string | undefined;
  
  private route = inject(ActivatedRoute);
  private genericService = inject(GenericServices);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Get courseID from parent route
    const parentRoute = this.route.parent;
    this.courseID = parentRoute?.snapshot.paramMap.get('courseID') ?? undefined;
    
    if (this.courseID) {
      this.loadMaterials();
    } else {
      this.genericService.showError('Course ID is required');
    }
  }

  loadMaterials(): void {
    if (!this.courseID) return;
    
    this.loading.set(true);
    const courseIdValue = Number(this.courseID);
    
    const sub = this.genericService.get<ApiResponse<CourseMaterialDTO[]>>(
      `api/course-materials/course/${courseIdValue}`
    ).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.materials.set(response.data);
        } else {
          this.genericService.showError(response.message || 'Failed to load materials');
          this.materials.set([]);
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error loading materials:', error);
        this.genericService.showError('Failed to load materials. Please try again.');
        this.materials.set([]);
      }
    });
    
    this.subscriptions.add(sub);
  }

  getIconClass(fileExtension: string): string {
    const ext = fileExtension.toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'fas fa-file-pdf text-danger';
      case '.pptx':
      case '.ppt':
        return 'fas fa-file-powerpoint text-warning';
      case '.docx':
      case '.doc':
        return 'fas fa-file-word text-primary';
      case '.xlsx':
      case '.xls':
        return 'fas fa-file-excel text-success';
      default:
        return 'fas fa-file';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
