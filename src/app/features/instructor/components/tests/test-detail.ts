import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../services/test.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { TestDTO, TestScoreDTO } from '../../models/instructor.models';
import { ToastrService } from 'ngx-toastr';
import { QuestionList } from './questions/question-list';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionList],
  templateUrl: './test-detail.html',
  styleUrl: './test-detail.scss'
})
export class InstructorTestDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testService = inject(TestService);
  private genericService = inject(GenericServices);
  private toastr = inject(ToastrService);

  courseId = signal<number | null>(null);
  testId = signal<number | null>(null);
  test = signal<TestDTO | null>(null);
  loading = signal<boolean>(false);
  
  // Tabs
  activeTab = signal<'scores' | 'questions'>('scores');
  
  // Scores
  scores = signal<TestScoreDTO[]>([]);
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalPages = signal<number>(0);
  loadingScores = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = +params['courseId'];
      const testId = +params['testId'];
      this.courseId.set(courseId);
      this.testId.set(testId);
      
      if (testId && courseId) {
        this.loadTest();
        this.loadScores();
      }
    });

    // Get page from query params
    this.route.queryParams.subscribe(params => {
      const page = +params['page'] || 1;
      this.currentPage.set(page);
      if (this.testId()) {
        this.loadScores();
      }
    });
  }

  loadTest(): void {
    const testId = this.testId();
    if (!testId) return;
    
    this.loading.set(true);
    this.testService.getTestById(testId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.test.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading test:', error);
        this.genericService.showError('Failed to load test');
        this.loading.set(false);
      }
    });
  }

  loadScores(): void {
    const testId = this.testId();
    if (!testId) return;
    
    this.loadingScores.set(true);
    this.testService.getTestScores(
      testId,
      this.currentPage(),
      this.pageSize()
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let items: TestScoreDTO[] = [];
          let totalPages = 0;
          
          if (Array.isArray(response.data)) {
            items = response.data;
            totalPages = 1;
          } else if (response.data && typeof response.data === 'object' && 'items' in response.data) {
            items = (response.data as any).items || [];
            totalPages = (response.data as any).totalPages || 0;
          }
          
          this.scores.set(items);
          this.totalPages.set(totalPages);
        } else {
          this.scores.set([]);
        }
        this.loadingScores.set(false);
      },
      error: (error) => {
        console.error('Error loading scores:', error);
        this.genericService.showError('Failed to load scores');
        this.scores.set([]);
        this.loadingScores.set(false);
      }
    });
  }

  setActiveTab(tab: 'scores' | 'questions'): void {
    this.activeTab.set(tab);
  }

  getScoreColor(score: number, passingScore: number | null): string {
    if (passingScore === null) return 'text-primary';
    if (score >= passingScore) return 'text-success';
    return 'text-danger';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge'
    });
    this.loadScores();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  navigateBack(): void {
    const courseId = this.courseId();
    if (courseId) {
      this.router.navigate(['/instructor/courses', courseId, 'tests']);
    }
  }
}

