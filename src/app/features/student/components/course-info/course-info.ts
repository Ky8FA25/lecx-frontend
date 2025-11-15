import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LectureDTO } from '../../models/lecture';
import { LectureService } from '../../services/lecture-service';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { StudentCourse } from '../../models/studentCourse';
import { Subscription, forkJoin } from 'rxjs';
import { StudentService } from '../../services/student-service';
import { ActivatedRoute } from '@angular/router';
import { CategoryDto } from '../../../home/models/categoryDto';
import { GenericServices } from '../../../../core/services/GenericServices';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';

@Component({
  selector: 'app-course-info',
  imports: [SharedModule],
  templateUrl: './course-info.html',
  styleUrl: './course-info.scss'
})
export class CourseInfo implements OnInit, OnDestroy{
 
  courses = signal<StudentCourse | null>(null);
  category = signal<CategoryDto | null>(null);
  loading = signal<boolean>(false);
  lectures = signal<LectureDTO[]>([]);
  completedLectures = signal<number[]>([]); // Array of completed lectureIds
  loadingLectures = signal<boolean>(false);
  
  private subscriptions = new Subscription(); 
  private studentservice = inject(StudentService);
  private genericService = inject(GenericServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  courseID: string | undefined;

  ngOnInit(): void {
    this.courseID = this.route.snapshot.paramMap.get('courseID') ?? undefined;
    const courseId = Number(this.courseID);
    
    if (courseId) {
      console.log('Loading course detail for ID:', courseId);
      this.loadStudentCourseDetail(courseId);
      this.loadLectures(courseId);
    }
  }
  
  loadStudentCourseDetail(courseId: number) {
    const studentcourse = this.studentservice.getStudentCourseDetailById('api/student-courses',courseId).subscribe({
      next: (res : any) => {
        this.courses.set(res.data);
        const categoryId = res.data?.course?.categoryId;
        if (categoryId) {
          this.loadCategoryDetail(categoryId);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load course detail:', err);
      }
    });
    this.subscriptions.add(studentcourse);
  }
  
  loadCategoryDetail(id: number) {
    const categories = this.studentservice.getCategoryDetailById('api/categories',id).subscribe({
      next: (res : any) => {
        this.category.set(res);
      },
      error: (err) => {
        console.error('❌ Failed to load course detail:', err);
      }
    });
    this.subscriptions.add(categories);
  }

  loadLectures(courseId: number): void {
    this.loadingLectures.set(true);
    
    const filters = {
      CourseId: courseId,
      PageIndex: 1,
      PageSize: 100
    };

    // Load lectures and completed lectures in parallel
    const lecturesSub = this.genericService.getWithFilter('/api/lectures/course', filters);
    const completedSub = this.genericService.getWithFilter('/api/lectures/course/completed', { courseId });

    const combinedSub = forkJoin({
      lectures: lecturesSub,
      completed: completedSub
    }).subscribe({
      next: (results) => {
        // Process lectures
        if (results.lectures.success) {
          let lectureList: LectureDTO[] = [];
          const lectureData = results.lectures.data as any;
          
          if ('items' in lectureData) {
            const paginatedData = lectureData as PaginatedResponse<LectureDTO>;
            lectureList = paginatedData.items || [];
          } else if (Array.isArray(lectureData)) {
            lectureList = lectureData;
          }
          
          this.lectures.set(lectureList);
        } else {
          this.lectures.set([]);
        }

        // Process completed lectures
        if (results.completed.success && results.completed.data) {
          const completedData = results.completed.data as any[];
          const completedIds = completedData.map((c: any) => c.lectureId);
          this.completedLectures.set(completedIds);
        } else {
          this.completedLectures.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading lectures:', err);
        this.lectures.set([]);
        this.completedLectures.set([]);
      },
      complete: () => {
        this.loadingLectures.set(false);
      }
    });

    this.subscriptions.add(combinedSub);
  }

  isLectureCompleted(lectureId: number | undefined): boolean {
    if (!lectureId) return false;
    return this.completedLectures().includes(lectureId);
  }

  goToLecture(lectureId: number | undefined): void {
    if (!lectureId || !this.courseID) return;
    this.router.navigate(['/student/course', this.courseID, 'lecture-detail'], { 
      queryParams: { lectureId } 
    });
  }

   ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
