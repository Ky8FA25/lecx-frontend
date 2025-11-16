import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../services/assignment.service';
import { StorageService } from '../../services/storage.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { AssignmentDTO, CreateAssignmentDto, UpdateAssignmentDto } from '../../models/instructor.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-list.html',
  styleUrl: './assignment-list.scss'
})
export class InstructorAssignmentList implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assignmentService = inject(AssignmentService);
  private storageService = inject(StorageService);
  private genericService = inject(GenericServices);
  private toastr = inject(ToastrService);

  courseId = signal<number | null>(null);
  assignments = signal<AssignmentDTO[]>([]);
  loading = signal<boolean>(false);

  // Create Assignment Modal
  showCreateModal = signal<boolean>(false);
  creatingAssignment = signal<boolean>(false);
  
  // Edit Assignment Modal
  showEditModal = signal<boolean>(false);
  editingAssignment = signal<boolean>(false);
  editingAssignmentId = signal<number | null>(null);
  
  // Delete Assignment Modal
  showDeleteModal = signal<boolean>(false);
  deletingAssignment = signal<boolean>(false);
  deletingAssignmentId = signal<number | null>(null);
  deletingAssignmentTitle = signal<string>('');
  
  // Form data
  newAssignmentTitle = signal<string>('');
  newAssignmentStartDate = signal<string>('');
  newAssignmentDueDate = signal<string>('');
  newAssignmentFile: File | null = null;
  
  // Edit form data
  editAssignmentTitle = signal<string>('');
  editAssignmentStartDate = signal<string>('');
  editAssignmentDueDate = signal<string>('');
  editAssignmentFile: File | null = null;
  existingAssignmentLink = signal<string>('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = +params['courseId'];
      this.courseId.set(courseId);
      
      if (courseId) {
        this.loadAssignments();
      }
    });
  }

  loadAssignments(): void {
    const courseId = this.courseId();
    if (!courseId) return;
    
    this.loading.set(true);
    this.assignmentService.getAssignmentsByCourse(courseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let assignments: AssignmentDTO[] = [];
          
          if (Array.isArray(response.data)) {
            assignments = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            if (Array.isArray((response.data as any).items)) {
              assignments = (response.data as any).items;
            } else {
              assignments = [];
            }
          }
          
          this.assignments.set(assignments);
        } else {
          this.assignments.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.genericService.showError('Failed to load assignments');
        this.assignments.set([]);
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.newAssignmentTitle.set('');
    this.newAssignmentStartDate.set('');
    this.newAssignmentDueDate.set('');
    this.newAssignmentFile = null;
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.newAssignmentTitle.set('');
    this.newAssignmentStartDate.set('');
    this.newAssignmentDueDate.set('');
    this.newAssignmentFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xlsx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!validTypes.includes(fileExtension)) {
        this.toastr.warning('Please select a valid file (.pdf, .doc, .docx, .ppt, .pptx, .xlsx)');
        return;
      }
      this.newAssignmentFile = file;
    }
  }

  createAssignment(): void {
    const courseId = this.courseId();
    if (!courseId || !this.newAssignmentTitle().trim()) {
      this.toastr.warning('Please enter assignment title');
      return;
    }

    if (!this.newAssignmentStartDate() || !this.newAssignmentDueDate()) {
      this.toastr.warning('Please select start date and due date');
      return;
    }

    const startDate = new Date(this.newAssignmentStartDate());
    const dueDate = new Date(this.newAssignmentDueDate());

    if (dueDate <= startDate) {
      this.toastr.warning('Due date must be after start date');
      return;
    }

    if (!this.newAssignmentFile) {
      this.toastr.warning('Please upload assignment file');
      return;
    }

    this.creatingAssignment.set(true);

    // Upload file first
    const prefix = `assignments/${courseId}`;
    this.storageService.uploadFile(this.newAssignmentFile, prefix).subscribe({
      next: (uploadResponse) => {
        if (uploadResponse.success) {
          const createDto: CreateAssignmentDto = {
            courseId: courseId,
            title: this.newAssignmentTitle().trim(),
            startDate: startDate,
            dueDate: dueDate,
            assignmentLink: uploadResponse.publicUrl
          };

          this.assignmentService.createAssignment(createDto).subscribe({
            next: (response) => {
              if (response.success && response.data) {
                this.toastr.success('Assignment created successfully');
                this.closeCreateModal();
                this.loadAssignments();
              } else {
                this.toastr.error(response.message || 'Failed to create assignment');
              }
              this.creatingAssignment.set(false);
            },
            error: (error) => {
              console.error('Error creating assignment:', error);
              this.toastr.error('Failed to create assignment');
              this.creatingAssignment.set(false);
            }
          });
        } else {
          this.toastr.error('File upload failed');
          this.creatingAssignment.set(false);
        }
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.toastr.error('Failed to upload file');
        this.creatingAssignment.set(false);
      }
    });
  }

  navigateToAssignment(assignmentId: number): void {
    const courseId = this.courseId();
    if (courseId) {
      this.router.navigate(['/instructor/courses', courseId, 'assignments', assignmentId]);
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isAvailable(assignment: AssignmentDTO): boolean {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const dueDate = new Date(assignment.dueDate);
    return now >= startDate && now <= dueDate;
  }

  isExpired(assignment: AssignmentDTO): boolean {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    return now > dueDate;
  }

  // Edit Assignment
  openEditModal(assignment: AssignmentDTO): void {
    this.editingAssignmentId.set(assignment.assignmentId);
    this.editAssignmentTitle.set(assignment.title);
    
    // Format dates for datetime-local input
    const startDate = new Date(assignment.startDate);
    const dueDate = new Date(assignment.dueDate);
    this.editAssignmentStartDate.set(this.formatDateTimeLocal(startDate));
    this.editAssignmentDueDate.set(this.formatDateTimeLocal(dueDate));
    
    this.existingAssignmentLink.set(assignment.assignmentLink);
    this.editAssignmentFile = null;
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingAssignmentId.set(null);
    this.editAssignmentTitle.set('');
    this.editAssignmentStartDate.set('');
    this.editAssignmentDueDate.set('');
    this.editAssignmentFile = null;
    this.existingAssignmentLink.set('');
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xlsx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!validTypes.includes(fileExtension)) {
        this.toastr.warning('Please select a valid file (.pdf, .doc, .docx, .ppt, .pptx, .xlsx)');
        return;
      }
      this.editAssignmentFile = file;
    }
  }

  updateAssignment(): void {
    const assignmentId = this.editingAssignmentId();
    if (!assignmentId || !this.editAssignmentTitle().trim()) {
      this.toastr.warning('Please enter assignment title');
      return;
    }

    if (!this.editAssignmentStartDate() || !this.editAssignmentDueDate()) {
      this.toastr.warning('Please select start date and due date');
      return;
    }

    const startDate = new Date(this.editAssignmentStartDate());
    const dueDate = new Date(this.editAssignmentDueDate());

    if (dueDate <= startDate) {
      this.toastr.warning('Due date must be after start date');
      return;
    }

    this.editingAssignment.set(true);

    // If new file is selected, upload it first
    if (this.editAssignmentFile) {
      const courseId = this.courseId();
      if (!courseId) {
        this.editingAssignment.set(false);
        return;
      }

      const prefix = `assignments/${courseId}`;
      this.storageService.uploadFile(this.editAssignmentFile, prefix).subscribe({
        next: (uploadResponse) => {
          if (uploadResponse.success) {
            this.performUpdate(assignmentId, startDate, dueDate, uploadResponse.publicUrl);
          } else {
            this.toastr.error('File upload failed');
            this.editingAssignment.set(false);
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.toastr.error('Failed to upload file');
          this.editingAssignment.set(false);
        }
      });
    } else {
      // Use existing file
      this.performUpdate(assignmentId, startDate, dueDate, this.existingAssignmentLink());
    }
  }

  private performUpdate(assignmentId: number, startDate: Date, dueDate: Date, assignmentLink: string): void {
    const updateDto: UpdateAssignmentDto = {
      title: this.editAssignmentTitle().trim(),
      startDate: startDate,
      dueDate: dueDate,
      assignmentLink: assignmentLink
    };

    this.assignmentService.updateAssignment(assignmentId, updateDto).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.toastr.success('Assignment updated successfully');
          this.closeEditModal();
          this.loadAssignments();
        } else {
          this.toastr.error(response.message || 'Failed to update assignment');
        }
        this.editingAssignment.set(false);
      },
      error: (error) => {
        console.error('Error updating assignment:', error);
        this.toastr.error('Failed to update assignment');
        this.editingAssignment.set(false);
      }
    });
  }

  // Delete Assignment
  openDeleteModal(assignment: AssignmentDTO): void {
    this.deletingAssignmentId.set(assignment.assignmentId);
    this.deletingAssignmentTitle.set(assignment.title);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingAssignmentId.set(null);
    this.deletingAssignmentTitle.set('');
  }

  deleteAssignment(): void {
    const assignmentId = this.deletingAssignmentId();
    if (!assignmentId) return;

    this.deletingAssignment.set(true);
    this.assignmentService.deleteAssignment(assignmentId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Assignment deleted successfully');
          this.closeDeleteModal();
          this.loadAssignments();
        } else {
          this.toastr.error(response.message || 'Failed to delete assignment');
        }
        this.deletingAssignment.set(false);
      },
      error: (error) => {
        console.error('Error deleting assignment:', error);
        this.toastr.error('Failed to delete assignment');
        this.deletingAssignment.set(false);
      }
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
}

