import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { TestScoreDTO, AssignmentDTO } from '../../../instructor/models/instructor.models';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';

interface AssignmentScoreItem {
  assignmentId: number;
  studentId: string;
  score: number;
  assignment?: AssignmentDTO;
  submissionDate?: Date;
}

interface AssignmentScoreResponse {
  assignmentScores: AssignmentScoreItem[];
}

@Component({
  selector: 'app-grade-list',
  imports: [CommonModule, SharedModule],
  templateUrl: './grade-list.html',
  styleUrl: './grade-list.scss'
})
export class GradeList implements OnInit, OnDestroy {
  assignmentScores = signal<AssignmentScoreItem[]>([]);
  testScores = signal<TestScoreDTO[]>([]);
  loading = signal<boolean>(false);
  courseID: string | undefined;
  
  private route = inject(ActivatedRoute);
  private genericService = inject(GenericServices);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    const id = parentRoute?.snapshot.paramMap.get('courseID') ?? undefined;
    this.courseID = id;
    
    if (this.courseID) {
      this.loadGrades();
    }
  }

  loadGrades(): void {
    this.loading.set(true);
    const courseIdValue = Number(this.courseID);

    // Load both assignment scores and test scores in parallel
    const assignmentScoresSub = this.genericService.get<ApiResponse<AssignmentScoreResponse>>(
      `api/assignmentscores/by-course/${courseIdValue}`
    );

    const testScoresSub = this.genericService.getWithFilter('/api/tests/scores', {
      CourseId: courseIdValue,
      PageIndex: 1,
      PageSize: 100
    });

    const combinedSub = forkJoin({
      assignments: assignmentScoresSub,
      tests: testScoresSub
    }).subscribe({
      next: (results) => {
        // Process assignment scores
        if (results.assignments.success && results.assignments.data) {
          const assignmentData = results.assignments.data as any;
          // Handle different response formats
          if (Array.isArray(assignmentData)) {
            this.assignmentScores.set(assignmentData);
          } else if (assignmentData.assignmentScores) {
            this.assignmentScores.set(assignmentData.assignmentScores);
          } else if (assignmentData.items) {
            this.assignmentScores.set(assignmentData.items);
          } else {
            this.assignmentScores.set([]);
          }
        } else {
          this.assignmentScores.set([]);
        }

        // Process test scores
        if (results.tests.success) {
          const testData = results.tests.data as any;
          if (testData.items && Array.isArray(testData.items)) {
            this.testScores.set(testData.items);
          } else if (Array.isArray(testData)) {
            this.testScores.set(testData);
          } else {
            this.testScores.set([]);
          }
        } else {
          this.testScores.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading grades:', err);
        this.genericService.showError('Failed to load grades. Please try again.');
        this.assignmentScores.set([]);
        this.testScores.set([]);
      },
      complete: () => {
        this.loading.set(false);
      }
    });

    this.subscriptions.add(combinedSub);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  }

  getAssignmentTitle(assignmentScore: AssignmentScoreItem): string {
    return assignmentScore.assignment?.title || 'N/A';
  }

  getTestTitle(testScore: TestScoreDTO): string {
    return testScore.test?.title || 'N/A';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
