import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { LectureDTO, LectureFileDto } from '../../models/lecture';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';

@Component({
  selector: 'app-lecture-detail',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './lecture-detail.html',
  styleUrl: './lecture-detail.scss'
})
export class LectureDetail implements OnInit, OnDestroy {
  lecture = signal<LectureDTO | null>(null);
  allLectures = signal<LectureDTO[]>([]);
  currentLectureIndex = signal<number>(-1);
  loading = signal<boolean>(false);
  markingCompleted = signal<boolean>(false);
  isCompleted = signal<boolean>(false);
  showReportModal = signal<boolean>(false);
  courseID: string | undefined;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private genericService = inject(GenericServices);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Get courseID from parent route
    const parentRoute = this.route.parent;
    this.courseID = parentRoute?.snapshot.paramMap.get('courseID') ?? undefined;
    
    // Load all lectures first if we have courseID
    if (this.courseID) {
      this.loadAllLectures();
    }
    
    // Get lectureId from query params
    this.route.queryParams.subscribe(params => {
      const lectureId = params['lectureId'];
      if (lectureId) {
        this.loadLectureDetail(Number(lectureId));
        this.checkCompletedStatus(Number(lectureId));
      } else {
        this.genericService.showError('Lecture ID is required');
        this.navigateBack();
      }
    });
  }

  loadAllLectures(): void {
    if (!this.courseID) return;
    
    const courseIdValue = Number(this.courseID);
    const filters = {
      CourseId: courseIdValue,
      PageIndex: 1,
      PageSize: 100
    };

    const lecturesSub = this.genericService.getWithFilter('/api/lectures/course', filters).subscribe({
      next: (res: ApiResponse<LectureDTO[]> | ApiResponse<PaginatedResponse<LectureDTO>>) => {
        if (res.success) {
          let lectureList: LectureDTO[] = [];
          
          if ('items' in (res.data as any)) {
            const paginatedData = res.data as PaginatedResponse<LectureDTO>;
            lectureList = paginatedData.items || [];
          } else {
            lectureList = (res.data as LectureDTO[]) || [];
          }
          
          this.allLectures.set(lectureList);
          
          // Find current lecture index after lectures are loaded
          const currentLecture = this.lecture();
          if (currentLecture?.lectureId) {
            const index = lectureList.findIndex(l => l.lectureId === currentLecture.lectureId);
            if (index !== -1) {
              this.currentLectureIndex.set(index);
            }
          }
        }
      },
      error: (err) => {
        console.error('Error loading lectures:', err);
      }
    });

    this.subscriptions.add(lecturesSub);
  }

  loadLectureDetail(lectureId: number): void {
    this.loading.set(true);
    
    const lectureSub = this.genericService.get<ApiResponse<LectureDTO>>(`api/lectures/${lectureId}`).subscribe({
      next: (res: ApiResponse<LectureDTO>) => {
        if (res.success && res.data) {
          this.lecture.set(res.data);
          
          // Update current lecture index after a short delay to ensure allLectures is loaded
          setTimeout(() => {
            const allLectures = this.allLectures();
            const index = allLectures.findIndex(l => l.lectureId === res.data?.lectureId);
            if (index !== -1) {
              this.currentLectureIndex.set(index);
            } else if (allLectures.length === 0 && this.courseID) {
              // Reload lectures if not loaded yet
              this.loadAllLectures();
            }
          }, 100);
        } else {
          this.genericService.showError('Failed to load lecture');
          this.navigateBack();
        }
      },
      error: (err) => {
        console.error('Error loading lecture detail:', err);
        this.genericService.showError('Failed to load lecture. Please try again.');
        this.navigateBack();
      },
      complete: () => {
        this.loading.set(false);
      }
    });

    this.subscriptions.add(lectureSub);
  }

  checkCompletedStatus(lectureId: number): void {
    // Load completed lectures for this course
    if (!this.courseID) return;
    
    const courseIdValue = Number(this.courseID);
    const completedSub = this.genericService.getWithFilter('/api/lectures/course/completed', {
      courseId: courseIdValue
    }).subscribe({
      next: (res: ApiResponse<any[]>) => {
        if (res.success && res.data) {
          const completedLectures = res.data as any[];
          const isCompleted = completedLectures.some(c => c.lectureId === lectureId);
          this.isCompleted.set(isCompleted);
        }
      },
      error: (err) => {
        console.error('Error checking completion status:', err);
      }
    });

    this.subscriptions.add(completedSub);
  }

  getVideoFiles(): LectureFileDto[] {
    const lecture = this.lecture();
    if (!lecture?.lectureFiles) return [];
    return lecture.lectureFiles.filter(f => 
      f.fileType?.toLowerCase() === 'video' || 
      ['mp4', 'mov', 'avi', 'webm'].includes(f.fileExtension?.toLowerCase() || '')
    );
  }

  getDocumentFiles(): LectureFileDto[] {
    const lecture = this.lecture();
    if (!lecture?.lectureFiles) return [];
    return lecture.lectureFiles.filter(f => 
      f.fileType?.toLowerCase() !== 'video' && 
      !['mp4', 'mov', 'avi', 'webm'].includes(f.fileExtension?.toLowerCase() || '')
    );
  }

  markAsCompleted(): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId) return;
    
    if (this.isCompleted()) {
      // Unmark as completed
      this.unmarkAsCompleted();
      return;
    }
    
    this.markingCompleted.set(true);
    const completeSub = this.genericService.post<ApiResponse<any>>(`api/lectures/completed/${lecture.lectureId}`, {}).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.isCompleted.set(true);
          this.genericService.showSuccess('Lecture marked as completed!');
        } else {
          this.genericService.showError(res.message || 'Failed to mark lecture as completed');
        }
      },
      error: (err) => {
        console.error('Error marking lecture as completed:', err);
        this.genericService.showError('Failed to mark lecture as completed. Please try again.');
      },
      complete: () => {
        this.markingCompleted.set(false);
      }
    });

    this.subscriptions.add(completeSub);
  }

  unmarkAsCompleted(): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId) return;
    
    this.markingCompleted.set(true);
    const unmarkSub = this.genericService.delete<ApiResponse<any>>(`api/lectures/completed/${lecture.lectureId}`).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.isCompleted.set(false);
          this.genericService.showSuccess('Lecture unmarked');
        } else {
          this.genericService.showError(res.message || 'Failed to unmark lecture');
        }
      },
      error: (err) => {
        console.error('Error unmarking lecture:', err);
        this.genericService.showError('Failed to unmark lecture. Please try again.');
      },
      complete: () => {
        this.markingCompleted.set(false);
      }
    });

    this.subscriptions.add(unmarkSub);
  }

  goToPreviousLecture(): void {
    const allLectures = this.allLectures();
    const currentIndex = this.currentLectureIndex();
    
    if (currentIndex > 0 && allLectures.length > 0) {
      const previousLecture = allLectures[currentIndex - 1];
      this.navigateToLecture(previousLecture.lectureId!);
    }
  }

  goToNextLecture(): void {
    const allLectures = this.allLectures();
    const currentIndex = this.currentLectureIndex();
    
    if (currentIndex < allLectures.length - 1 && allLectures.length > 0) {
      const nextLecture = allLectures[currentIndex + 1];
      this.navigateToLecture(nextLecture.lectureId!);
    }
  }

  navigateToLecture(lectureId: number): void {
    if (!this.courseID) return;
    this.router.navigate(['/student/course', this.courseID, 'lecture-detail'], { 
      queryParams: { lectureId } 
    });
  }

  hasPreviousLecture(): boolean {
    return this.currentLectureIndex() > 0;
  }

  hasNextLecture(): boolean {
    const allLectures = this.allLectures();
    const currentIndex = this.currentLectureIndex();
    return currentIndex >= 0 && currentIndex < allLectures.length - 1;
  }

  openReportModal(): void {
    this.showReportModal.set(true);
  }

  closeReportModal(): void {
    this.showReportModal.set(false);
  }

  navigateBack(): void {
    if (this.courseID) {
      this.router.navigate(['/student/course', this.courseID]);
    } else {
      this.router.navigate(['/student/my-courses']);
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
