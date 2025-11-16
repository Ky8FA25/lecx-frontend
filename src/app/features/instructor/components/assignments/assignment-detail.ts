import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../services/assignment.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { AssignmentDTO, SubmissionDTO, AssignmentScoreDTO, CreateAssignmentScoreDto, UpdateAssignmentScoreDto } from '../../models/instructor.models';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-detail.html',
  styleUrl: './assignment-detail.scss'
})
export class AssignmentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assignmentService = inject(AssignmentService);
  private genericService = inject(GenericServices);
  private toastr = inject(ToastrService);

  courseId = signal<number | null>(null);
  assignmentId = signal<number | null>(null);
  assignment = signal<AssignmentDTO | null>(null);
  submissions = signal<SubmissionDTO[]>([]);
  loading = signal<boolean>(false);
  
  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalPages = signal<number>(0);
  
  // Scores map: studentId -> score
  scores = signal<Map<string, number>>(new Map());
  // AssignmentScoreId map: studentId -> assignmentScoreId (to know if we need to update or create)
  assignmentScoreIds = signal<Map<string, number>>(new Map());
  savingScores = signal<Map<string, boolean>>(new Map());

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = +params['courseId'];
      const assignmentId = +params['assignmentId'];
      this.courseId.set(courseId);
      this.assignmentId.set(assignmentId);
      
      if (assignmentId && courseId) {
        this.loadAssignment();
        this.loadSubmissions();
      }
    });

    // Get page from query params
    this.route.queryParams.subscribe(params => {
      const page = +params['page'] || 1;
      this.currentPage.set(page);
      if (this.assignmentId()) {
        this.loadSubmissions();
      }
    });
  }

  loadAssignment(): void {
    const assignmentId = this.assignmentId();
    if (!assignmentId) return;
    
    this.loading.set(true);
    this.assignmentService.getAssignmentById(assignmentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.assignment.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading assignment:', error);
        this.genericService.showError('Failed to load assignment');
        this.loading.set(false);
      }
    });
  }

  loadSubmissions(): void {
    const assignmentId = this.assignmentId();
    if (!assignmentId) return;
    
    this.loading.set(true);
    this.assignmentService.getSubmissionsByAssignment(
      assignmentId,
      this.currentPage(),
      this.pageSize()
    ).subscribe({
      next: (response) => {
        if (response.data) {
          let items: SubmissionDTO[] = [];
          let totalPages = 0;
          items = response.data.items || [];
          totalPages = response.data.totalPages || 0;
          
          this.submissions.set(items);
          console.log('Loaded submissions:', items);
          console.log('After set:', this.submissions());
          this.totalPages.set(totalPages);
          
          // Load scores for each submission
          this.loadScoresForSubmissions(items);
        } else {
          this.submissions.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading submissions:', error);
        this.genericService.showError('Failed to load submissions');
        this.submissions.set([]);
        this.loading.set(false);
      }
    });
  }

  updateScore(studentId: string, score: number): void {
    const scores = this.scores();
    scores.set(studentId, score);
    this.scores.set(new Map(scores));
  }

  loadScoresForSubmissions(submissions: SubmissionDTO[]): void {
    const assignmentId = this.assignmentId();
    if (!assignmentId || submissions.length === 0) return;

    const scoresMap = new Map<string, number>();
    const scoreIdsMap = new Map<string, number>();
    
    // Load scores for all submissions in parallel using forkJoin
    const scoreRequests = submissions.map(submission => 
      this.assignmentService.getAssignmentScore(assignmentId, submission.studentId).pipe(
        map(response => ({
          studentId: submission.studentId,
          response: response
        })),
        catchError(error => {
          // Score doesn't exist yet, that's okay
          console.log(`No score found for student ${submission.studentId}`);
          return of({ studentId: submission.studentId, response: null });
        })
      )
    );

    forkJoin(scoreRequests).subscribe({
      next: (results) => {
        results.forEach(result => {
          if (result.response && result.response.success && result.response.data) {
            scoresMap.set(result.studentId, result.response.data.score);
            scoreIdsMap.set(result.studentId, result.response.data.assignmentScoreId);
          }
        });
        this.scores.set(scoresMap);
        this.assignmentScoreIds.set(scoreIdsMap);
      },
      error: (error) => {
        console.error('Error loading scores:', error);
        // Still set empty maps so UI doesn't break
        this.scores.set(scoresMap);
        this.assignmentScoreIds.set(scoreIdsMap);
      }
    });
  }

  saveScore(submission: SubmissionDTO): void {
    const assignmentId = this.assignmentId();
    if (!assignmentId) return;
    
    const score = this.scores().get(submission.studentId);
    if (score === undefined || score === null) {
      this.toastr.warning('Please enter a score');
      return;
    }

    if (score < 0 || score > 10) {
      this.toastr.warning('Score must be between 0 and 10');
      return;
    }

    const savingScores = this.savingScores();
    savingScores.set(submission.studentId, true);
    this.savingScores.set(new Map(savingScores));

    const assignmentScoreId = this.assignmentScoreIds().get(submission.studentId);

    if (assignmentScoreId) {
      // Update existing score
      const updateDto: UpdateAssignmentScoreDto = {
        score: score
      };

      this.assignmentService.updateAssignmentScore(assignmentScoreId, updateDto).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.toastr.success('Score updated successfully');
            // Update the score in our map
            const scores = this.scores();
            scores.set(submission.studentId, response.data.score);
            this.scores.set(new Map(scores));
          } else {
            this.toastr.error(response.message || 'Failed to update score');
          }
          const savingScores = this.savingScores();
          savingScores.set(submission.studentId, false);
          this.savingScores.set(new Map(savingScores));
        },
        error: (error) => {
          console.error('Error updating score:', error);
          this.toastr.error('Failed to update score');
          const savingScores = this.savingScores();
          savingScores.set(submission.studentId, false);
          this.savingScores.set(new Map(savingScores));
        }
      });
    } else {
      // Create new score
      const createDto: CreateAssignmentScoreDto = {
        studentId: submission.studentId,
        assignmentId: assignmentId,
        score: score
      };

      this.assignmentService.createAssignmentScore(createDto).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.toastr.success('Score saved successfully');
            // Update the score and assignmentScoreId in our maps
            const scores = this.scores();
            scores.set(submission.studentId, response.data.score);
            this.scores.set(new Map(scores));
            
            const scoreIds = this.assignmentScoreIds();
            scoreIds.set(submission.studentId, response.data.assignmentScoreId);
            this.assignmentScoreIds.set(new Map(scoreIds));
          } else {
            this.toastr.error(response.message || 'Failed to save score');
          }
          const savingScores = this.savingScores();
          savingScores.set(submission.studentId, false);
          this.savingScores.set(new Map(savingScores));
        },
        error: (error) => {
          console.error('Error creating score:', error);
          this.toastr.error('Failed to save score');
          const savingScores = this.savingScores();
          savingScores.set(submission.studentId, false);
          this.savingScores.set(new Map(savingScores));
        }
      });
    }
  }

  getScore(studentId: string): number {
    return this.scores().get(studentId) || 0;
  }

  isSaving(studentId: string): boolean {
    return this.savingScores().get(studentId) || false;
  }

  isLate(submission: SubmissionDTO): boolean {
    const assignment = this.assignment();
    if (!assignment) return false;
    
    const submissionDate = new Date(submission.submissionDate);
    const dueDate = new Date(assignment.dueDate);
    return submissionDate > dueDate;
  }

  getScoreColor(score: number): string {
    if (score >= 5) return 'text-success';
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

  formatDateShort(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  truncateFileName(fileName: string, maxLength: number = 60): string {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength) + '...';
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge'
    });
    this.loadSubmissions();
  }

  navigateBack(): void {
    const courseId = this.courseId();
    if (courseId) {
      this.router.navigate(['/instructor/courses', courseId, 'assignments']);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }
}

