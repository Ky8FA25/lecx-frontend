import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { QuestionDTO, TestDTO } from '../../../instructor/models/instructor.models';
import { ApiResponse } from '../../../../core/models/generic-response-class';

interface Answer {
  questionId: number;
  selectedAnswer: string;
}

interface SubmitTestRequest {
  testId: number;
  answers: Answer[];
}

@Component({
  selector: 'app-do-test',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './do-test.html',
  styleUrl: './do-test.scss'
})
export class DoTest implements OnInit, OnDestroy {
  questions = signal<QuestionDTO[]>([]);
  currentQuestionIndex = signal<number>(0);
  answers = signal<Map<number, string>>(new Map());
  testId: number | null = null;
  test = signal<TestDTO | null>(null);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  timeLeft = signal<number>(0); // seconds
  showConfirmModal = signal<boolean>(false);
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private genericService = inject(GenericServices);
  private subscriptions = new Subscription();
  private timerInterval?: Subscription;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const testIdParam = params['testId'];
      if (testIdParam) {
        this.testId = Number(testIdParam);
        this.loadTestInfo();
        this.loadQuestions();
      } else {
        this.genericService.showError('Test ID is required');
        this.router.navigate(['/student/my-courses']);
      }
    });
  }

  loadTestInfo(): void {
    if (!this.testId) return;
    
    const testSub = this.genericService.get<ApiResponse<TestDTO>>(`api/tests/${this.testId}`).subscribe({
      next: (res: ApiResponse<TestDTO>) => {
        if (res.success && res.data) {
          this.test.set(res.data);
          this.initializeTimer(res.data.testTime);
        }
      },
      error: (err) => {
        console.error('Error loading test info:', err);
      }
    });
    this.subscriptions.add(testSub);
  }

  loadQuestions(): void {
    if (!this.testId) return;
    
    this.loading.set(true);
    const questionsSub = this.genericService.get<ApiResponse<QuestionDTO[]>>(`api/tests/${this.testId}/attempt/questions`).subscribe({
      next: (res: ApiResponse<QuestionDTO[]>) => {
        if (res.success && res.data) {
          this.questions.set(res.data);
          // Initialize answers map
          const answersMap = new Map<number, string>();
          res.data.forEach(q => {
            answersMap.set(q.questionId, '');
          });
          this.answers.set(answersMap);
        } else {
          this.genericService.showError('Failed to load questions');
          this.router.navigate(['/student/my-courses']);
        }
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        this.genericService.showError('Failed to load questions. Please try again.');
        this.router.navigate(['/student/my-courses']);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
    this.subscriptions.add(questionsSub);
  }

  initializeTimer(testTime: string | null): void {
    if (!testTime) {
      // No time limit
      this.timeLeft.set(-1);
      return;
    }

    // Parse testTime from "HH:mm:ss" format to seconds
    const parts = testTime.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      this.timeLeft.set(totalSeconds);

      // Start timer
      this.startTimer();
    }
  }

  startTimer(): void {
    if (this.timerInterval) {
      this.timerInterval.unsubscribe();
    }

    this.timerInterval = interval(1000).subscribe(() => {
      const current = this.timeLeft();
      if (current > 0) {
        this.timeLeft.set(current - 1);
      } else if (current === 0) {
        // Time's up, auto submit
        this.submitTest();
      }
    });
    
    if (this.timerInterval) {
      this.subscriptions.add(this.timerInterval);
    }
  }

  formatTime(seconds: number): string {
    if (seconds < 0) return 'Unlimited';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    const total = this.questions().length;
    if (total === 0) return 0;
    const answered = Array.from(this.answers().values()).filter(a => a !== '').length;
    return (answered / total) * 100;
  }

  currentQuestion(): QuestionDTO | null {
    const questions = this.questions();
    const index = this.currentQuestionIndex();
    return questions[index] || null;
  }

  showQuestion(index: number): void {
    if (index >= 0 && index < this.questions().length) {
      this.currentQuestionIndex.set(index);
    }
  }

  nextQuestion(): void {
    const currentIndex = this.currentQuestionIndex();
    if (currentIndex < this.questions().length - 1) {
      this.currentQuestionIndex.set(currentIndex + 1);
    }
  }

  previousQuestion(): void {
    const currentIndex = this.currentQuestionIndex();
    if (currentIndex > 0) {
      this.currentQuestionIndex.set(currentIndex - 1);
    }
  }

  onAnswerChange(questionId: number, answer: string): void {
    const answers = this.answers();
    answers.set(questionId, answer);
    this.answers.set(new Map(answers));
  }

  getSelectedAnswer(questionId: number): string {
    return this.answers().get(questionId) || '';
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.answers().get(questionId) !== '' && this.answers().get(questionId) !== undefined;
  }

  openConfirmModal(): void {
    const answeredCount = Array.from(this.answers().values()).filter(a => a !== '').length;
    const totalQuestions = this.questions().length;
    
    if (answeredCount < totalQuestions) {
      if (confirm(`You have answered ${answeredCount} out of ${totalQuestions} questions. Do you want to submit anyway?`)) {
        this.showConfirmModal.set(true);
      }
    } else {
      this.showConfirmModal.set(true);
    }
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  submitTest(): void {
    if (!this.testId) return;
    
    this.submitting.set(true);
    this.closeConfirmModal();

    // Build answers array
    const answersArray: Answer[] = [];
    this.answers().forEach((selectedAnswer, questionId) => {
      if (selectedAnswer) {
        answersArray.push({
          questionId,
          selectedAnswer
        });
      }
    });

    const submitRequest: SubmitTestRequest = {
      testId: this.testId,
      answers: answersArray
    };

    const submitSub = this.genericService.post<ApiResponse<any>>('api/tests/scores', submitRequest).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.genericService.showSuccess('Test submitted successfully!');
          // Navigate to test list
          const courseId = this.test()?.courseId;
          if (courseId) {
            this.router.navigate(['/student/course', courseId, 'test-list']);
          } else {
            this.router.navigate(['/student/my-courses']);
          }
        } else {
          this.genericService.showError(res.message || 'Failed to submit test');
          this.submitting.set(false);
        }
      },
      error: (err) => {
        console.error('Error submitting test:', err);
        this.genericService.showError('Failed to submit test. Please try again.');
        this.submitting.set(false);
      }
    });

    this.subscriptions.add(submitSub);
  }

  confirmSubmit(): void {
    this.submitTest();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      this.timerInterval.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }
}
