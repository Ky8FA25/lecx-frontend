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
  
  studentCourseID: number | undefined;
  courseID: number | undefined;

  ngOnInit(): void {
    // Lấy studentCourseID từ route params (từ my-course.ts)
    const studentCourseIDParam = this.route.snapshot.paramMap.get('studentcourseID');
    
    if (studentCourseIDParam) {
      this.studentCourseID = Number(studentCourseIDParam);
      
      if (this.studentCourseID) {
        console.log('Loading student course detail for ID:', this.studentCourseID);
        // Bước 1: Load student course detail để lấy courseID
        this.loadStudentCourseDetail(this.studentCourseID);
      }
    } else {
      console.error('❌ StudentCourseID not found in route params');
    }
  }
  
  /**
   * Bước 1: Load student course detail từ API
   * Sau khi có response, sẽ lấy courseID và gọi loadLectures
   */
  loadStudentCourseDetail(studentCourseID: number): void {
    this.loading.set(true);
    
    const studentcourseSub = this.studentservice
      .getStudentCourseDetailById('api/student-courses', studentCourseID)
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            this.courses.set(res.data);

            // Lấy courseID từ API response (có thể từ data.courseId hoặc data.course.courseId)
            this.courseID = res.data?.courseId || res.data?.course?.courseId;
            
            console.log('✅ Student course loaded. Course ID:', this.courseID);

            // Bước 2: Load lectures sau khi đã có courseID từ API response
            if (this.courseID) {
              this.loadLectures(this.courseID);
            } else {
              console.warn('⚠️ CourseID not found in response');
            }

            // Load category nếu có
            const categoryId = res.data?.course?.categoryId;
            if (categoryId) {
              this.loadCategoryDetail(categoryId);
            }
          } else {
            console.error('❌ Invalid response format:', res);
          }
        },
        error: (err) => {
          console.error('❌ Failed to load student course detail:', err);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        }
      });

    this.subscriptions.add(studentcourseSub);
  }

  
  loadCategoryDetail(id: number): void {
    const categoriesSub = this.studentservice.getCategoryDetailById('api/categories', id).subscribe({
      next: (res: any) => {
        this.category.set(res);
      },
      error: (err) => {
        console.error('❌ Failed to load category detail:', err);
      }
    });
    this.subscriptions.add(categoriesSub);
  }

  /**
   * Bước 2: Load lectures sử dụng courseID đã lấy từ API student-course
   * @param courseId - Course ID lấy từ API loadStudentCourseDetail
   */
  loadLectures(courseId: number): void {
  this.loadingLectures.set(true);

  const filters = {
    courseId: courseId,   // 🔥 quan trọng: phải là courseId (chứ không phải CourseId)
    pageIndex: 1,
    pageSize: 100
  };

  const lecturesRequest = this.genericService.getWithFilter('/api/lectures/course', filters);
  const completedRequest = this.genericService.getWithFilter('/api/lectures/course/completed', { courseId });

  const combinedSub = forkJoin({
    lectures: lecturesRequest,
    completed: completedRequest
  }).subscribe({
    next: (results) => {

      /** -------------------------
       *  Lectures
       * ------------------------- */
      if (results.lectures.success) {
        let lectureList: LectureDTO[] = [];
        const data = results.lectures.data;

        if (data?.items) {
          // Nếu backend trả về dạng Pagination
          lectureList = data.items;
        } else if (Array.isArray(data)) {
          lectureList = data;
        }

        this.lectures.set(lectureList);
      } else {
        this.lectures.set([]);
      }

      /** -------------------------
       *  Completed Lectures
       * ------------------------- */
      if (results.completed.success && Array.isArray(results.completed.data)) {
        const completedIds = results.completed.data.map((c: any) => c.lectureId);
        this.completedLectures.set(completedIds);
      } else {
        this.completedLectures.set([]);
      }
    },

    error: (err) => {
      console.error('❌ Error loading lectures:', err);
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
