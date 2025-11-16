import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { TestDTO, TestScoreDTO } from '../../../instructor/models/instructor.models';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';

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
  private subscriptions = new Subscription();
  
  courseID: string | undefined;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    const id = parentRoute?.snapshot.paramMap.get('courseID') ?? undefined;
    this.courseID = id;
    if (this.courseID) {
      // Load user first, then tests
      this.loadUserProfile();
    }
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
    this.loading.set(true);
    const courseIdValue = Number(this.courseID);
    
    const filters = {
      CourseId: courseIdValue,
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
    this.router.navigate(['/student/test'], { queryParams: { testId } });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
