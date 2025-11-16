import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { TestDTO, TestScoreDTO } from '../../../instructor/models/instructor.models';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';
import { StudentService } from '../../services/student-service';

interface TestWithScore extends TestDTO {
  score?: TestScoreDTO;
  attemptsLeft?: number;
}

@Component({
  selector: 'app-test-list',
  imports: [SharedModule],
  templateUrl: './test-list.html',
  styleUrl: './test-list.scss',
})
export class TestList implements OnInit, OnDestroy {
  tests = signal<TestWithScore[]>([]);
  loading = signal<boolean>(false);
  currentDate = new Date();
  user = signal<any>(null);
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private genericService = inject(GenericServices);
  private studentService = inject(StudentService);
  private subscriptions = new Subscription();
  
  studentCourseID: number | undefined;
  courseID: number | undefined;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    // Lấy studentcourseID từ route params (từ course-layout)
    const parentRoute = this.route.parent;
    const studentCourseIDParam = parentRoute?.snapshot.paramMap.get('studentcourseID');
    
    if (studentCourseIDParam) {
      this.studentCourseID = Number(studentCourseIDParam);
      
      if (this.studentCourseID) {
        // Bước 1: Load student course detail để lấy courseID
        this.loadStudentCourseDetail(this.studentCourseID);
      }
    } else {
      console.error('❌ StudentCourseID not found in route params');
      this.genericService.showError('Course not found');
    }
  }

  /**
   * Load student course detail để lấy courseID
   * Sau đó dùng courseID để load tests
   */
  loadStudentCourseDetail(studentCourseID: number): void {
    const studentcourseSub = this.studentService
      .getStudentCourseDetailById('api/student-courses', studentCourseID)
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            // Lấy courseID từ API response
            const courseId = res.data?.courseId || res.data?.course?.courseId;
            
            if (courseId) {
              this.courseID = courseId;
              console.log('✅ Course ID loaded:', this.courseID);
              
              // Bước 2: Load user profile và tests sau khi đã có courseID
              this.loadUserProfile();
            } else {
              console.warn('⚠️ CourseID not found in response');
              this.genericService.showError('Failed to load course information');
            }
          }
        },
        error: (err) => {
          console.error('❌ Failed to load student course detail:', err);
          this.genericService.showError('Failed to load course information');
        }
      });

    this.subscriptions.add(studentcourseSub);
  }

  loadUserProfile(): void {
    const userSub = this.genericService.get('api/profile/me').subscribe({
      next: (res: any) => {
        this.user.set(res.data || res);
        // After user is loaded, load tests
        this.loadTests();
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        // Still try to load tests even if user profile fails
        this.loadTests();
      }
    });
    this.subscriptions.add(userSub);
  }

  loadTests(): void {
    if (!this.courseID) {
      console.warn('⚠️ CourseID not available, cannot load tests');
      return;
    }
    
    this.loading.set(true);
    const courseIdValue = Number(this.courseID);
    
    const filters = {
      CourseId: courseIdValue,  // Giữ nguyên CourseId nếu API yêu cầu
      PageNumber: this.currentPage,
      PageSize: this.pageSize
    };

    const testSubscription = this.genericService.getWithFilter('/api/tests', filters).subscribe({
      next: (res: ApiResponse<TestDTO[]> | ApiResponse<PaginatedResponse<TestDTO>>) => {
        if (res.success) {
          let testList: TestDTO[] = [];
          
          // Check if response is paginated or array
          if ('items' in (res.data as any)) {
            const paginatedData = res.data as PaginatedResponse<TestDTO>;
            testList = paginatedData.items || [];
            this.totalPages = paginatedData.totalPages || 1;
          } else {
            testList = (res.data as TestDTO[]) || [];
          }

          // Load test scores for student
          if (testList.length > 0) {
            this.loadTestScores(testList);
          } else {
            this.tests.set([]);
          }
        } else {
          this.tests.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading tests:', err);
        this.genericService.showError('Failed to load tests. Please try again.');
        this.tests.set([]);
      },
      complete: () => {
        this.loading.set(false);
      }
    });

    this.subscriptions.add(testSubscription);
  }

  loadTestScores(tests: TestDTO[]): void {
    const userId = this.user()?.id;
    if (!userId) {
      this.tests.set(tests);
      return;
    }

    // Get all test scores for the current student
    const scoreSub = this.genericService.getWithFilter('/api/tests/scores', {
      pageIndex: 1,
      pageSize: 100 // Get all scores to match with tests
    }).subscribe({
      next: (res: ApiResponse<PaginatedResponse<TestScoreDTO>>) => {
        if (res.success && res.data) {
          const scores = res.data.items || [];
          const testScoreMap = new Map<number, TestScoreDTO>();
          
          // Map scores by testId
          scores.forEach(score => {
            if (score.studentId === userId) {
              // Keep the latest score for each test
              const existing = testScoreMap.get(score.testId);
              if (!existing || score.numberOfAttempt > existing.numberOfAttempt) {
                testScoreMap.set(score.testId, score);
              }
            }
          });

          // Combine tests with their scores
          const testsWithScores: TestWithScore[] = tests.map(test => {
            const score = testScoreMap.get(test.testId);
            let attemptsLeft: number | undefined;
            
            if (score && test.numberOfMaxAttempt != null) {
              attemptsLeft = test.numberOfMaxAttempt - score.numberOfAttempt;
            } else if (test.numberOfMaxAttempt != null) {
              attemptsLeft = test.numberOfMaxAttempt;
            }

            return {
              ...test,
              score,
              attemptsLeft
            };
          });

          this.tests.set(testsWithScores);
        } else {
          this.tests.set(tests);
        }
      },
      error: (err) => {
        console.error('Error loading test scores:', err);
        this.tests.set(tests);
      }
    });

    this.subscriptions.add(scoreSub);
  }

  getAttemptsLeft(test: TestWithScore): number {
    if (test.attemptsLeft !== undefined) {
      return test.attemptsLeft;
    }
    if (test.numberOfMaxAttempt == null) {
      return -1; // Unlimited attempts
    }
    if (test.score) {
      return test.numberOfMaxAttempt - test.score.numberOfAttempt;
    }
    return test.numberOfMaxAttempt;
  }

  getScore(test: TestWithScore): number | null {
    return test.score?.scoreValue ?? null;
  }

  isTestAvailable(test: TestDTO): boolean {
    const now = this.currentDate;
    return new Date(test.startTime) <= now && new Date(test.endTime) >= now;
  }

  isTestNotStarted(test: TestDTO): boolean {
    return new Date(test.startTime) > this.currentDate;
  }

  isTestEnded(test: TestDTO): boolean {
    return new Date(test.endTime) < this.currentDate;
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Active';
      case 1:
        return 'Inactive';
      case 2:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  }

  navigateToDoTest(testId: number): void {
    // Truyền studentcourseID qua query params để có thể navigate về test-list sau khi submit
    const queryParams: any = { testId };
    if (this.studentCourseID) {
      queryParams.studentcourseID = this.studentCourseID;
    }
    this.router.navigate(['/student/test'], { queryParams });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
