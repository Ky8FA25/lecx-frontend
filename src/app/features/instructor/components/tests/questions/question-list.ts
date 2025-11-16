import { Component, OnInit, AfterViewInit, inject, signal, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../../services/question.service';
import { StorageService } from '../../../services/storage.service';
import { GenericServices } from '../../../../../core/services/GenericServices';
import { QuestionDTO, CreateQuestionDto, UpdateQuestionDto, CreateQuestionsListDto } from '../../../models/instructor.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-list.html',
  styleUrl: './question-list.scss'
})
export class QuestionList implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private questionService = inject(QuestionService);
  private storageService = inject(StorageService);
  private genericService = inject(GenericServices);
  private toastr = inject(ToastrService);

  // Inputs from parent component
  testId = input<number | null>(null);
  courseId = input<number | null>(null);
  
  // Internal state
  questions = signal<QuestionDTO[]>([]);
  loading = signal<boolean>(false);

  // Create Single Question Modal
  showCreateModal = signal<boolean>(false);
  creatingQuestion = signal<boolean>(false);
  
  // Create Multiple Questions Modal
  showCreateMultipleModal = signal<boolean>(false);
  creatingMultipleQuestions = signal<boolean>(false);
  
  // Edit Question Modal
  showEditModal = signal<boolean>(false);
  editingQuestion = signal<boolean>(false);
  editingQuestionId = signal<number | null>(null);
  
  // Delete Question Modal
  showDeleteModal = signal<boolean>(false);
  deletingQuestion = signal<boolean>(false);
  deletingQuestionId = signal<number | null>(null);
  
  // Form data - Single question
  newQuestionContent = signal<string>('');
  newAnswerA = signal<string>('');
  newAnswerB = signal<string>('');
  newAnswerC = signal<string>('');
  newAnswerD = signal<string>('');
  newCorrectAnswer = signal<'A' | 'B' | 'C' | 'D'>('A');
  newQuestionImage: File | null = null;
  
  // Form data - Multiple questions
  multipleQuestions = signal<CreateQuestionDto[]>([]);
  currentQuestionIndex = signal<number>(0);
  
  // Edit form data
  editQuestionContent = signal<string>('');
  editAnswerA = signal<string>('');
  editAnswerB = signal<string>('');
  editAnswerC = signal<string>('');
  editAnswerD = signal<string>('');
  editCorrectAnswer = signal<'A' | 'B' | 'C' | 'D' | null>('A');
  editQuestionImage: File | null = null;
  existingImagePath = signal<string | null>(null);

  ngOnInit(): void {
    // Component initialization - don't load here to avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  ngAfterViewInit(): void {
    // Defer loading to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
    // Component will be recreated when tab changes, so no need to watch for changes
    setTimeout(() => {
      const testId = this.getTestId();
      if (testId) {
        this.loadQuestions();
      }
    }, 0);
  }

  getTestId(): number | null {
    // Get from input first, then try route
    let testId = this.testId();
    if (!testId) {
      const params = this.route.snapshot.params;
      testId = +params['testId'];
      if (!testId && this.route.parent) {
        const parentParams = this.route.parent.snapshot.params;
        testId = +parentParams['testId'];
      }
    }
    return testId;
  }

  loadQuestions(): void {
    const testId = this.getTestId();
    if (!testId) return;
    this.loadQuestionsForTest(testId);
  }

  private loadQuestionsForTest(testId: number): void {
    
    this.loading.set(true);
    this.questionService.getQuestionsByTest(testId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let questions: QuestionDTO[] = [];          
          questions = response.data.items;          
          this.questions.set(questions);
        } else {
          this.questions.set([]);
        }
        console.log('Questions loaded:', this.questions());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.genericService.showError('Failed to load questions');
        this.questions.set([]);
        this.loading.set(false);
      }
    });
  }

  // Create Single Question
  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.resetCreateForm();
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.resetCreateForm();
  }

  resetCreateForm(): void {
    this.newQuestionContent.set('');
    this.newAnswerA.set('');
    this.newAnswerB.set('');
    this.newAnswerC.set('');
    this.newAnswerD.set('');
    this.newCorrectAnswer.set('A');
    this.newQuestionImage = null;
  }

  onQuestionImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.toastr.warning('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }
      this.newQuestionImage = file;
    }
  }

  onEditQuestionImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.toastr.warning('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }
      this.editQuestionImage = file;
    }
  }

  createQuestion(): void {
    const testId = this.getTestId();
    if (!testId) return;

    if (!this.newQuestionContent().trim() || 
        !this.newAnswerA().trim() || 
        !this.newAnswerB().trim() || 
        !this.newAnswerC().trim() || 
        !this.newAnswerD().trim()) {
      this.toastr.warning('Please fill in all required fields');
      return;
    }

    this.creatingQuestion.set(true);

    const createQuestion = (imagePath: string | null = null) => {
      const createDto: CreateQuestionDto = {
        testId: testId,
        questionContent: this.newQuestionContent().trim(),
        answerA: this.newAnswerA().trim(),
        answerB: this.newAnswerB().trim(),
        answerC: this.newAnswerC().trim(),
        answerD: this.newAnswerD().trim(),
        correctAnswer: this.newCorrectAnswer(),
        imagePath: imagePath
      };

      this.questionService.createQuestion(createDto).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.toastr.success('Question created successfully');
            this.closeCreateModal();
            this.loadQuestions();
          } else {
            this.toastr.error(response.message || 'Failed to create question');
          }
          this.creatingQuestion.set(false);
        },
        error: (error) => {
          console.error('Error creating question:', error);
          this.toastr.error('Failed to create question');
          this.creatingQuestion.set(false);
        }
      });
    };

    if (this.newQuestionImage) {
      const prefix = `questions/${testId}`;
      this.storageService.uploadFile(this.newQuestionImage, prefix).subscribe({
        next: (uploadResponse) => {
          if (uploadResponse.success) {
            createQuestion(uploadResponse.publicUrl);
          } else {
            this.toastr.error('Image upload failed');
            this.creatingQuestion.set(false);
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.toastr.error('Failed to upload image');
          this.creatingQuestion.set(false);
        }
      });
    } else {
      createQuestion();
    }
  }

  // Create Multiple Questions
  openCreateMultipleModal(): void {
    this.showCreateMultipleModal.set(true);
    this.multipleQuestions.set([this.createEmptyQuestion()]);
    this.currentQuestionIndex.set(0);
  }

  closeCreateMultipleModal(): void {
    this.showCreateMultipleModal.set(false);
    this.multipleQuestions.set([]);
    this.currentQuestionIndex.set(0);
  }

  createEmptyQuestion(): CreateQuestionDto {
    return {
      testId: this.getTestId()!,
      questionContent: '',
      answerA: '',
      answerB: '',
      answerC: '',
      answerD: '',
      correctAnswer: 'A',
      imagePath: null
    };
  }

  addQuestionToMultiple(): void {
    const questions = this.multipleQuestions();
    questions.push(this.createEmptyQuestion());
    this.multipleQuestions.set([...questions]);
    this.currentQuestionIndex.set(questions.length - 1);
  }

  removeQuestionFromMultiple(index: number): void {
    const questions = this.multipleQuestions();
    if (questions.length > 1) {
      questions.splice(index, 1);
      this.multipleQuestions.set([...questions]);
      if (this.currentQuestionIndex() >= questions.length) {
        this.currentQuestionIndex.set(questions.length - 1);
      }
    }
  }

  updateMultipleQuestion(index: number, field: string, value: any): void {
    const questions = this.multipleQuestions();
    if (questions[index]) {
      (questions[index] as any)[field] = value;
      this.multipleQuestions.set([...questions]);
    }
  }

  createMultipleQuestions(): void {
    const testId = this.getTestId();
    if (!testId) return;

    const questions = this.multipleQuestions();
    if (questions.length === 0) {
      this.toastr.warning('Please add at least one question');
      return;
    }

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionContent.trim() || 
          !q.answerA.trim() || 
          !q.answerB.trim() || 
          !q.answerC.trim() || 
          !q.answerD.trim()) {
        this.toastr.warning(`Please fill in all fields for question ${i + 1}`);
        return;
      }
    }

    this.creatingMultipleQuestions.set(true);

    const createDto: CreateQuestionsListDto = {
      testId: testId,
      questions: questions
    };

    this.questionService.createQuestionsList(createDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(`${response.message}`);
          this.closeCreateMultipleModal();
          this.loadQuestions();
        } else {
          this.toastr.error(response.message || 'Failed to create questions');
        }
        this.creatingMultipleQuestions.set(false);
      },
      error: (error) => {
        console.error('Error creating questions:', error);
        this.toastr.error('Failed to create questions');
        this.creatingMultipleQuestions.set(false);
      }
    });
  }

  // Edit Question
  openEditModal(question: QuestionDTO): void {
    this.editingQuestionId.set(question.questionId);
    this.editQuestionContent.set(question.questionContent);
    this.editAnswerA.set(question.answerA);
    this.editAnswerB.set(question.answerB);
    this.editAnswerC.set(question.answerC);
    this.editAnswerD.set(question.answerD);
    this.editCorrectAnswer.set(question.correctAnswer || 'A');
    this.existingImagePath.set(question.imagePath);
    this.editQuestionImage = null;
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingQuestionId.set(null);
    this.editQuestionContent.set('');
    this.editAnswerA.set('');
    this.editAnswerB.set('');
    this.editAnswerC.set('');
    this.editAnswerD.set('');
    this.editCorrectAnswer.set('A');
    this.existingImagePath.set(null);
    this.editQuestionImage = null;
  }

  updateQuestion(): void {
    const questionId = this.editingQuestionId();
    if (!questionId) return;

    this.editingQuestion.set(true);

    const updateQuestion = (imagePath: string | null = null) => {
      const updateDto: UpdateQuestionDto = {
        questionId: questionId,
        questionContent: this.editQuestionContent().trim() || null,
        answerA: this.editAnswerA().trim() || null,
        answerB: this.editAnswerB().trim() || null,
        answerC: this.editAnswerC().trim() || null,
        answerD: this.editAnswerD().trim() || null,
        correctAnswer: this.editCorrectAnswer(),
        imagePath: imagePath
      };

      this.questionService.updateQuestion(updateDto).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.toastr.success('Question updated successfully');
            this.closeEditModal();
            this.loadQuestions();
          } else {
            this.toastr.error(response.message || 'Failed to update question');
          }
          this.editingQuestion.set(false);
        },
        error: (error) => {
          console.error('Error updating question:', error);
          this.toastr.error('Failed to update question');
          this.editingQuestion.set(false);
        }
      });
    };

    if (this.editQuestionImage) {
      const testId = this.getTestId();
      if (!testId) {
        this.editingQuestion.set(false);
        return;
      }
      const prefix = `questions/${testId}`;
      this.storageService.uploadFile(this.editQuestionImage, prefix).subscribe({
        next: (uploadResponse) => {
          if (uploadResponse.success) {
            updateQuestion(uploadResponse.publicUrl);
          } else {
            this.toastr.error('Image upload failed');
            this.editingQuestion.set(false);
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.toastr.error('Failed to upload image');
          this.editingQuestion.set(false);
        }
      });
    } else {
      updateQuestion(this.existingImagePath());
    }
  }

  // Delete Question
  openDeleteModal(question: QuestionDTO): void {
    this.deletingQuestionId.set(question.questionId);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingQuestionId.set(null);
  }

  deleteQuestion(): void {
    const questionId = this.deletingQuestionId();
    if (!questionId) return;

    this.deletingQuestion.set(true);
    this.questionService.deleteQuestion(questionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Question deleted successfully');
          this.closeDeleteModal();
          this.loadQuestions();
        } else {
          this.toastr.error(response.message || 'Failed to delete question');
        }
        this.deletingQuestion.set(false);
      },
      error: (error) => {
        console.error('Error deleting question:', error);
        this.toastr.error('Failed to delete question');
        this.deletingQuestion.set(false);
      }
    });
  }

  getCorrectAnswerClass(answer: string, correctAnswer: string | null): string {
    if (correctAnswer === answer) {
      return 'text-success fw-bold';
    }
    return '';
  }
}

