import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../services/test.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { TestDTO, CreateTestDto, UpdateTestDto } from '../../models/instructor.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-list.html',
  styleUrl: './test-list.scss'
})
export class TestLists implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testService = inject(TestService);
  private genericService = inject(GenericServices);
  private toastr = inject(ToastrService);

  courseId = signal<number | null>(null);
  tests = signal<TestDTO[]>([]);
  loading = signal<boolean>(false);

  // Create Test Modal
  showCreateModal = signal<boolean>(false);
  creatingTest = signal<boolean>(false);
  
  // Edit Test Modal
  showEditModal = signal<boolean>(false);
  editingTest = signal<boolean>(false);
  editingTestId = signal<number | null>(null);
  
  // Delete Test Modal
  showDeleteModal = signal<boolean>(false);
  deletingTest = signal<boolean>(false);
  deletingTestId = signal<number | null>(null);
  deletingTestTitle = signal<string>('');
  
  // Form data
  newTestTitle = signal<string>('');
  newTestDescription = signal<string>('');
  newTestStartTime = signal<string>('');
  newTestEndTime = signal<string>('');
  newTestHours = signal<number>(0);
  newTestMinutes = signal<number>(0);
  newTestPassingScore = signal<number | null>(null);
  newTestAllowRedo = signal<string>('Yes');
  newTestMaxAttempt = signal<number | null>(null);
  newTestStatus = signal<number>(0); // 0: Active, 1: Inactive
  newTestNumberOfQuestion = signal<number>(0);
  
  // Edit form data
  editTestTitle = signal<string>('');
  editTestDescription = signal<string>('');
  editTestStartTime = signal<string>('');
  editTestEndTime = signal<string>('');
  editTestHours = signal<number>(0);
  editTestMinutes = signal<number>(0);
  editTestPassingScore = signal<number | null>(null);
  editTestAllowRedo = signal<string>('Yes');
  editTestMaxAttempt = signal<number | null>(null);
  editTestStatus = signal<number>(0);
  editTestNumberOfQuestion = signal<number>(0);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = +params['courseId'];
      this.courseId.set(courseId);
      
      if (courseId) {
        this.loadTests();
      }
    });
  }

  loadTests(): void {
    const courseId = this.courseId();
    if (!courseId) return;
    
    this.loading.set(true);
    this.testService.getTestsByCourse(courseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let tests: TestDTO[] = [];
          
          if (Array.isArray(response.data)) {
            tests = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            if (Array.isArray((response.data as any).items)) {
              tests = (response.data as any).items;
            } else {
              tests = [];
            }
          }
          
          this.tests.set(tests);
        } else {
          this.tests.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.genericService.showError('Failed to load tests');
        this.tests.set([]);
        this.loading.set(false);
      }
    });
  }

  // Create Test
  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.resetCreateForm();
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.resetCreateForm();
  }

  resetCreateForm(): void {
    this.newTestTitle.set('');
    this.newTestDescription.set('');
    this.newTestStartTime.set('');
    this.newTestEndTime.set('');
    this.newTestHours.set(0);
    this.newTestMinutes.set(0);
    this.newTestPassingScore.set(null);
    this.newTestAllowRedo.set('Yes');
    this.newTestMaxAttempt.set(null);
    this.newTestStatus.set(0);
    this.newTestNumberOfQuestion.set(0);
  }

  createTest(): void {
    const courseId = this.courseId();
    if (!courseId || !this.newTestTitle().trim()) {
      this.toastr.warning('Please enter test title');
      return;
    }

    if (!this.newTestStartTime() || !this.newTestEndTime()) {
      this.toastr.warning('Please select start time and end time');
      return;
    }

    const startTime = new Date(this.newTestStartTime());
    const endTime = new Date(this.newTestEndTime());

    if (endTime <= startTime) {
      this.toastr.warning('End time must be after start time');
      return;
    }

    // Format testTime as HH:mm:ss
    const hours = this.newTestHours() || 0;
    const minutes = this.newTestMinutes() || 0;
    const testTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    this.creatingTest.set(true);

    const createDto: CreateTestDto = {
      title: this.newTestTitle().trim(),
      description: this.newTestDescription().trim() || null,
      courseId: courseId,
      startTime: startTime,
      testTime: testTime,
      endTime: endTime,
      numberOfQuestion: this.newTestNumberOfQuestion() || 0,
      status: this.newTestStatus(),
      passingScore: this.newTestPassingScore() || null,
      alowRedo: this.newTestAllowRedo(),
      numberOfMaxAttempt: this.newTestAllowRedo() === 'Yes' ? (this.newTestMaxAttempt() || 1) : null
    };

    this.testService.createTest(createDto).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.toastr.success('Test created successfully');
          this.closeCreateModal();
          this.loadTests();
        } else {
          this.toastr.error(response.message || 'Failed to create test');
        }
        this.creatingTest.set(false);
      },
      error: (error) => {
        console.error('Error creating test:', error);
        this.toastr.error('Failed to create test');
        this.creatingTest.set(false);
      }
    });
  }

  // Edit Test
  openEditModal(test: TestDTO): void {
    this.editingTestId.set(test.testId);
    this.editTestTitle.set(test.title);
    this.editTestDescription.set(test.description || '');
    
    // Format dates for datetime-local input
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);
    this.editTestStartTime.set(this.formatDateTimeLocal(startTime));
    this.editTestEndTime.set(this.formatDateTimeLocal(endTime));
    
    // Parse testTime (HH:mm:ss) to hours and minutes
    if (test.testTime) {
      const timeParts = test.testTime.split(':');
      this.editTestHours.set(parseInt(timeParts[0]) || 0);
      this.editTestMinutes.set(parseInt(timeParts[1]) || 0);
    } else {
      this.editTestHours.set(0);
      this.editTestMinutes.set(0);
    }
    
    this.editTestPassingScore.set(test.passingScore);
    this.editTestAllowRedo.set(test.alowRedo);
    this.editTestMaxAttempt.set(test.numberOfMaxAttempt);
    this.editTestStatus.set(test.status);
    this.editTestNumberOfQuestion.set(test.numberOfQuestion);
    
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingTestId.set(null);
    this.editTestTitle.set('');
    this.editTestDescription.set('');
    this.editTestStartTime.set('');
    this.editTestEndTime.set('');
    this.editTestHours.set(0);
    this.editTestMinutes.set(0);
    this.editTestPassingScore.set(null);
    this.editTestAllowRedo.set('Yes');
    this.editTestMaxAttempt.set(null);
    this.editTestStatus.set(0);
    this.editTestNumberOfQuestion.set(0);
  }

  updateTest(): void {
    const testId = this.editingTestId();
    if (!testId || !this.editTestTitle().trim()) {
      this.toastr.warning('Please enter test title');
      return;
    }

    if (!this.editTestStartTime() || !this.editTestEndTime()) {
      this.toastr.warning('Please select start time and end time');
      return;
    }

    const startTime = new Date(this.editTestStartTime());
    const endTime = new Date(this.editTestEndTime());

    if (endTime <= startTime) {
      this.toastr.warning('End time must be after start time');
      return;
    }

    // Format testTime as HH:mm:ss
    const hours = this.editTestHours() || 0;
    const minutes = this.editTestMinutes() || 0;
    const testTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    this.editingTest.set(true);

    const updateDto: UpdateTestDto = {
      title: this.editTestTitle().trim(),
      description: this.editTestDescription().trim() || null,
      startTime: startTime,
      testTime: testTime,
      endTime: endTime,
      numberOfQuestion: this.editTestNumberOfQuestion(),
      status: this.editTestStatus(),
      passingScore: this.editTestPassingScore() || null,
      alowRedo: this.editTestAllowRedo(),
      numberOfMaxAttempt: this.editTestAllowRedo() === 'Yes' ? (this.editTestMaxAttempt() || 1) : null
    };

    this.testService.updateTest(testId, updateDto).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.toastr.success('Test updated successfully');
          this.closeEditModal();
          this.loadTests();
        } else {
          this.toastr.error(response.message || 'Failed to update test');
        }
        this.editingTest.set(false);
      },
      error: (error) => {
        console.error('Error updating test:', error);
        this.toastr.error('Failed to update test');
        this.editingTest.set(false);
      }
    });
  }

  // Delete Test
  openDeleteModal(test: TestDTO): void {
    this.deletingTestId.set(test.testId);
    this.deletingTestTitle.set(test.title);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingTestId.set(null);
    this.deletingTestTitle.set('');
  }

  deleteTest(): void {
    const testId = this.deletingTestId();
    if (!testId) return;

    this.deletingTest.set(true);
    this.testService.deleteTest(testId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Test deleted successfully');
          this.closeDeleteModal();
          this.loadTests();
        } else {
          this.toastr.error(response.message || 'Failed to delete test');
        }
        this.deletingTest.set(false);
      },
      error: (error) => {
        console.error('Error deleting test:', error);
        this.toastr.error('Failed to delete test');
        this.deletingTest.set(false);
      }
    });
  }

  navigateToTest(testId: number): void {
    const courseId = this.courseId();
    if (courseId) {
      this.router.navigate(['/instructor/courses', courseId, 'tests', testId]);
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTimeLocal(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Active';
      case 1: return 'Inactive';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-success';
      case 1: return 'bg-secondary';
      case 2: return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}

