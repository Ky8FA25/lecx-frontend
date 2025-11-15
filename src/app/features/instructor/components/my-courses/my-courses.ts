import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { InstructorService } from '../../services/instructor.service';
import { StorageService } from '../../services/storage.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { CourseModel, CreateCourseDto, UpdateCourseDto } from '../../models/instructor.models';
import { CategoryDto } from '../../../home/models/categoryDto';
import { CommonModule } from '@angular/common';
import { CourseLevel } from '../../../../core/enums/enums';

@Component({
  selector: 'app-instructor-my-courses',
  standalone: true,
  imports: [SharedModule, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.scss'
})
export class InstructorMyCourses implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instructorService = inject(InstructorService);
  private storageService = inject(StorageService);
  private genericService = inject(GenericServices);

  courses = signal<CourseModel[]>([]);
  categories = signal<CategoryDto[]>([]);
  loading = signal(false);
  totalPages = signal(1);
  currentPage = signal(1);
  selectedCategory = signal<number | null>(null);
  selectedLevel = signal<number | null>(null);

  // Modals
  showCreateModal = signal(false);
  showUpdateModal = signal(false);
  showDeleteModal = signal(false);
  showStatusModal = signal(false);
  selectedCourse = signal<CourseModel | null>(null);

  // Forms
  createForm = new FormGroup({
    courseCode: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.minLength(20)]),
    coverImage: new FormControl<File | null>(null),
    categoryId: new FormControl<number>(0, [Validators.required]),
    level: new FormControl<number>(0, [Validators.required]),
    price: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    endDate: new FormControl<string | null>(null)
  });

  updateForm = new FormGroup({
    courseCode: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.minLength(20)]),
    coverImage: new FormControl<File | null>(null),
    categoryId: new FormControl<number>(0, [Validators.required]),
    level: new FormControl<number>(0, [Validators.required]),
    price: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    endDate: new FormControl<string | null>(null)
  });

  ngOnInit() {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      const category = params['category'] ? +params['category'] : null;
      const level = params['level'] ? this.getLevelNumber(params['level']) : null;
      const page = params['page'] ? +params['page'] : 1;
      
      this.selectedCategory.set(category);
      this.selectedLevel.set(level);
      this.currentPage.set(page);
      this.loadCourses();
    });
  }

  loadCategories() {
    this.genericService.get<{ success: boolean; data: CategoryDto[] }>('api/categories/all').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadCourses() {
    this.loading.set(true);
    this.instructorService.getMyCourses(
      this.selectedCategory() || undefined,
      this.selectedLevel() || undefined,
      this.currentPage(),
      10
    ).subscribe({
      next: (response: any) => {
        console.log('✅ Courses API Response:', response);
        console.log('📋 Response structure:', {
          success: response?.success,
          hasData: !!response?.data,
          dataType: typeof response?.data,
          dataKeys: response?.data ? Object.keys(response.data) : [],
          hasItems: response?.data && 'items' in response.data,
          directItems: (response as any)?.items ? 'yes' : 'no',
          itemsLength: response?.data?.items?.length || (response as any)?.items?.length || 0
        });
        
        let coursesToSet: CourseModel[] = [];
        let totalPagesToSet = 1;
        
        // Handle different response formats
        if (response) {
          // Format 1: { success: true, data: { items: [], totalPages: 1 } } - ApiResponse wrapper
          if (response.success && response.data) {
            const data = response.data;
            
            // Check if data has items property (PaginatedResponse format)
            if (data.items && Array.isArray(data.items)) {
              console.log('✅ Format 1: ApiResponse<PaginatedResponse> - Found', data.items.length, 'courses');
              coursesToSet = data.items;
              totalPagesToSet = data.totalPages || 1;
            } 
            // Check if data is directly an array
            else if (Array.isArray(data)) {
              console.log('✅ Format 1b: ApiResponse<Array> - Found', data.length, 'courses');
              coursesToSet = data;
              totalPagesToSet = 1;
            }
          } 
          // Format 2: Direct PaginatedResponse { items: [], totalPages: 1 } - No ApiResponse wrapper
          else if ((response as any).items && Array.isArray((response as any).items)) {
            const paginatedResponse = response as any;
            console.log('✅ Format 2: Direct PaginatedResponse - Found', paginatedResponse.items.length, 'courses');
            coursesToSet = paginatedResponse.items;
            totalPagesToSet = paginatedResponse.totalPages || 1;
          }
          // Format 3: Direct array
          else if (Array.isArray(response)) {
            console.log('✅ Format 3: Direct Array - Found', response.length, 'courses');
            coursesToSet = response;
            totalPagesToSet = 1;
          } 
          // Format 4: { data: { items: [] } } - Data without success property
          else if (response.data && (response.data as any).items && Array.isArray((response.data as any).items)) {
            const data = response.data as any;
            console.log('✅ Format 4: Data with items - Found', data.items.length, 'courses');
            coursesToSet = data.items;
            totalPagesToSet = data.totalPages || 1;
          }
          else {
            console.warn('⚠️ Unknown response format:', response);
            console.warn('Response keys:', Object.keys(response));
          }
        }
        
        // Set courses if found
        if (coursesToSet.length > 0) {
          this.courses.set(coursesToSet);
          this.totalPages.set(totalPagesToSet);
          console.log('✅ Successfully set', coursesToSet.length, 'courses');
        } else {
          console.warn('⚠️ No courses found in response');
        }
        
        console.log('📚 Final courses count:', this.courses().length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading courses:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.genericService.showError(err.error?.message || 'Failed to load courses');
        this.loading.set(false);
      }
    });
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
    this.updateUrl();
  }

  filterByLevel(level: number | null) {
    this.selectedLevel.set(level);
    this.currentPage.set(1);
    this.updateUrl();
  }

  updateUrl() {
    const params: any = {};
    if (this.selectedCategory()) params['category'] = this.selectedCategory();
    if (this.selectedLevel() !== null) params['level'] = this.getLevelString(this.selectedLevel()!);
    if (this.currentPage() > 1) params['page'] = this.currentPage();
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params
    });
  }

  getLevelNumber(level: string): number {
    const map: { [key: string]: number } = {
      'beginner': 0,
      'intermediate': 1,
      'advanced': 2
    };
    return map[level.toLowerCase()] ?? 0;
  }

  getLevelString(level: number): string {
    const map: { [key: number]: string } = {
      0: 'beginner',
      1: 'intermediate',
      2: 'advanced'
    };
    return map[level] ?? 'beginner';
  }

  getLevelLabel(level: string): string {
    const map: { [key: string]: string } = {
      'Beginner': 'Beginner',
      'Intermediate': 'Intermediate',
      'Advanced': 'Advanced'
    };
    return map[level] || level;
  }

  openCreateModal() {
    this.createForm.reset();
    this.showCreateModal.set(true);
  }

  openUpdateModal(course: CourseModel) {
    this.selectedCourse.set(course);
    this.updateForm.patchValue({
      courseCode: course.courseCode,
      title: course.title,
      description: course.description || '',
      categoryId: course.categoryId,
      level: this.getLevelNumber(course.level),
      price: course.price,
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : null
    });
    this.showUpdateModal.set(true);
  }

  openDeleteModal(course: CourseModel) {
    this.selectedCourse.set(course);
    this.showDeleteModal.set(true);
  }

  openStatusModal(course: CourseModel) {
    this.selectedCourse.set(course);
    this.showStatusModal.set(true);
  }

  async onCreateSubmit() {
    if (!this.createForm.valid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    let coverImagePath: string | null = null;

    // Upload cover image if provided
    if (formValue.coverImage) {
      try {
        const uploadResponse = await this.storageService.uploadFile(formValue.coverImage, 'courses').toPromise();
        if (uploadResponse?.success && uploadResponse.data) {
          coverImagePath = uploadResponse.data.publicUrl;
        }
      } catch (err) {
        this.genericService.showError('Failed to upload cover image');
        return;
      }
    }

    const createDto: CreateCourseDto = {
      courseCode: formValue.courseCode!,
      title: formValue.title!,
      description: formValue.description || null,
      coverImagePath: coverImagePath,
      instructorId: '', // Will be set by backend from JWT
      categoryId: formValue.categoryId!,
      level: formValue.level!,
      status: null,
      price: formValue.price!,
      endDate: formValue.endDate ? new Date(formValue.endDate) : null
    };

    this.instructorService.createCourse(createDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.genericService.showSuccess('Course created successfully');
          this.showCreateModal.set(false);
          this.loadCourses();
        } else {
          this.genericService.showError(response.message || 'Failed to create course');
        }
      },
      error: (err) => {
        console.error('Error creating course:', err);
        this.genericService.showError('Failed to create course');
      }
    });
  }

  async onUpdateSubmit() {
    if (!this.updateForm.valid || !this.selectedCourse()) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const formValue = this.updateForm.value;
    const course = this.selectedCourse()!;
    let coverImagePath: string | null = course.coverImagePath;

    // Upload new cover image if provided
    if (formValue.coverImage) {
      try {
        const uploadResponse = await this.storageService.uploadFile(formValue.coverImage, 'courses').toPromise();
        if (uploadResponse?.success && uploadResponse.data) {
          coverImagePath = uploadResponse.data.publicUrl;
        }
      } catch (err) {
        this.genericService.showError('Failed to upload cover image');
        return;
      }
    }

    const updateDto: UpdateCourseDto = {
      title: formValue.title!,
      courseCode: formValue.courseCode!,
      description: formValue.description || null,
      coverImagePath: coverImagePath,
      categoryId: formValue.categoryId!,
      level: formValue.level!,
      price: formValue.price!,
      endDate: formValue.endDate ? new Date(formValue.endDate) : null
    };

    this.instructorService.updateCourse(course.courseId, updateDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.genericService.showSuccess('Course updated successfully');
          this.showUpdateModal.set(false);
          this.loadCourses();
        } else {
          this.genericService.showError(response.message || 'Failed to update course');
        }
      },
      error: (err) => {
        console.error('Error updating course:', err);
        this.genericService.showError('Failed to update course');
      }
    });
  }

  onDeleteSubmit() {
    const course = this.selectedCourse();
    if (!course) return;

    this.instructorService.deleteCourse(course.courseId).subscribe({
      next: (response) => {
        if (response.success) {
          this.genericService.showSuccess('Course deleted successfully');
          this.showDeleteModal.set(false);
          this.loadCourses();
        } else {
          this.genericService.showError(response.message || 'Failed to delete course');
        }
      },
      error: (err) => {
        console.error('Error deleting course:', err);
        this.genericService.showError('Failed to delete course');
      }
    });
  }

  onStatusSubmit() {
    const course = this.selectedCourse();
    if (!course) return;

    // Toggle status: Active (3) <-> Inactive (4)
    const newStatus = course.status === 'Active' ? 4 : 3;

    this.instructorService.setCourseStatus(course.courseId, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.genericService.showSuccess(`Course ${newStatus === 3 ? 'enabled' : 'disabled'} successfully`);
          this.showStatusModal.set(false);
          this.loadCourses();
        } else {
          this.genericService.showError(response.message || 'Failed to update course status');
        }
      },
      error: (err) => {
        console.error('Error updating course status:', err);
        this.genericService.showError('Failed to update course status');
      }
    });
  }

  goToCourse(courseId: number) {
    this.router.navigate(['/instructor/courses', courseId, 'dashboard'], {
      queryParams: { CourseID: courseId }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updateUrl();
    }
  }

  onFileSelected(event: Event, form: 'create' | 'update') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (form === 'create') {
        this.createForm.patchValue({ coverImage: file });
      } else {
        this.updateForm.patchValue({ coverImage: file });
      }
    }
  }
}

