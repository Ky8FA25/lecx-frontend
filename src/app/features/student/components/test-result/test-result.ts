import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { TestScoreDTO, QuestionDTO, TestDTO } from '../../../instructor/models/instructor.models';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';

interface QuestionWithAnswer extends QuestionDTO {
  userAnswer?: string;
  isCorrect?: boolean;
}

@Component({
  selector: 'app-test-result',
  imports: [CommonModule, SharedModule],
  templateUrl: './test-result.html',
  styleUrl: './test-result.scss'
})
export class TestResult implements OnInit, OnDestroy {
  testScore = signal<TestScoreDTO | null>(null);
  questions = signal<QuestionWithAnswer[]>([]);
  loading = signal<boolean>(false);
  testId: number | null = null;
  studentCourseID: number | null = null;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private genericService = inject(GenericServices);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const testIdParam = params['testId'];
      const studentCourseIDParam = params['studentcourseID'];
      
      if (testIdParam) {
        this.testId = Number(testIdParam);
        this.studentCourseID = studentCourseIDParam ? Number(studentCourseIDParam) : null;
        
        // Load test score và questions
        this.loadTestResult();
      } else {
        this.genericService.showError('Test ID is required');
        this.router.navigate(['/student/my-courses']);
      }
    });
  }

  loadTestResult(): void {
    if (!this.testId) return;
    
    this.loading.set(true);
    
    // Load test score (lấy score mới nhất của user cho test này)
    const testScoreSub = this.genericService.getWithFilter('/api/tests/scores', {
      TestId: this.testId,
      PageIndex: 1,
      PageSize: 1
    });
    
    // Load questions của test
    const questionsSub = this.genericService.get<ApiResponse<QuestionDTO[]>>(
      `api/tests/${this.testId}/questions?PageIndex=1&PageSize=100`
    );
    
    const combinedSub = forkJoin({
      testScore: testScoreSub,
      questions: questionsSub
    }).subscribe({
      next: (results) => {
        // Process test score
        if (results.testScore.success && results.testScore.data) {
          let testScores: TestScoreDTO[] = [];
          
          // Check if response is paginated
          if ('items' in (results.testScore.data as any)) {
            const paginatedData = results.testScore.data as PaginatedResponse<TestScoreDTO>;
            testScores = paginatedData.items || [];
          } else if (Array.isArray(results.testScore.data)) {
            testScores = results.testScore.data as TestScoreDTO[];
          }
          
          // Lấy test score mới nhất (số attempt cao nhất)
          if (testScores.length > 0) {
            const latestScore = testScores.reduce((prev, current) => 
              (current.numberOfAttempt > prev.numberOfAttempt) ? current : prev
            );
            this.testScore.set(latestScore);
          }
        }
        
        // Process questions
        if (results.questions.success && results.questions.data) {
          let questionsList: QuestionDTO[] = [];
          
          // Check if response is paginated
          const questionsData = results.questions.data as any;
          if ('items' in questionsData) {
            const paginatedData = questionsData as PaginatedResponse<QuestionDTO>;
            questionsList = paginatedData.items || [];
          } else if (Array.isArray(questionsData)) {
            questionsList = questionsData as QuestionDTO[];
          }
          
          // Kiểm tra xem test score có chứa answers không (từ API response nếu có)
          const testScoreData = this.testScore();
          const answersMap = new Map<number, string>();
          
          // Nếu API response có chứa answers, map vào
          // (có thể cần gọi API riêng để lấy answers nếu không có trong response)
          // Tạm thời để undefined vì TestScoreDTO không có field answers
          
          // Map questions với user answers và check correct
          const questionsWithAnswers: QuestionWithAnswer[] = questionsList.map(q => {
            const userAnswer = answersMap.get(q.questionId!);
            let isCorrect: boolean | undefined = undefined;
            
            if (userAnswer && q.correctAnswer) {
              isCorrect = userAnswer.toUpperCase() === q.correctAnswer.toUpperCase();
            }
            
            return {
              ...q,
              userAnswer,
              isCorrect
            };
          });
          
          this.questions.set(questionsWithAnswers);
        }
      },
      error: (err) => {
        console.error('Error loading test result:', err);
        this.genericService.showError('Failed to load test result. Please try again.');
      },
      complete: () => {
        this.loading.set(false);
      }
    });
    
    this.subscriptions.add(combinedSub);
  }

  getScore(): number {
    const score = this.testScore();
    return score?.scoreValue ?? 0;
  }

  getTotalQuestions(): number {
    return this.questions().length;
  }

  getCorrectAnswers(): number {
    return this.questions().filter(q => q.isCorrect).length;
  }

  getProgressPercentage(): number {
    const total = this.getTotalQuestions();
    if (total === 0) return 0;
    const correct = this.getCorrectAnswers();
    return (correct / total) * 100;
  }

  getAttemptsLeft(): number {
    const score = this.testScore();
    const test = score?.test;
    
    if (!test || test.numberOfMaxAttempt == null) {
      return -1; // Unlimited attempts
    }
    
    const attemptsUsed = score?.numberOfAttempt ?? 0;
    return test.numberOfMaxAttempt - attemptsUsed;
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

  getAnswerText(question: QuestionWithAnswer, answerKey: string): string {
    switch (answerKey) {
      case 'A':
        return question.answerA;
      case 'B':
        return question.answerB;
      case 'C':
        return question.answerC;
      case 'D':
        return question.answerD;
      default:
        return '';
    }
  }

  navigateBack(): void {
    if (this.studentCourseID) {
      this.router.navigate(['/student/course', this.studentCourseID, 'test-list']);
    } else {
      this.router.navigate(['/student/my-courses']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}