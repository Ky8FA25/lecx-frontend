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
import { GoogleStoragePaths } from '../../../../core/models/google-storage-paths';

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
  
  // Loading states
  creating = signal(false);
  updating = signal(false);
  
  // Image previews
  createImagePreview = signal<string | null>(null);
  updateImagePreview = signal<string | null>(null);

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
    this.genericService.get<any>('api/categories/all').subscribe({
      next: (response) => {
        console.log('📋 Categories API Response:', response);
        
        let categoriesToSet: CategoryDto[] = [];
        
        // Handle different response formats
        if (response) {
          // Format 1: { success: true, data: [{ categoryId, categoryName, description }] }
          if (response.success && response.data && Array.isArray(response.data)) {
            console.log('✅ Format 1: ApiResponse with data array - Found', response.data.length, 'categories');
            categoriesToSet = response.data.map((cat: any) => ({
              categoryId: cat.categoryId,
              fullName: cat.fullName || cat.categoryName || cat.name || 'Unknown',
              description: cat.description || ''
            }));
          }
          // Format 2: { categories: [{ categoryId, fullName, description }] }
          else if (response.categories && Array.isArray(response.categories)) {
            console.log('✅ Format 2: Direct categories array - Found', response.categories.length, 'categories');
            categoriesToSet = response.categories.map((cat: any) => ({
              categoryId: cat.categoryId,
              fullName: cat.fullName || cat.categoryName || cat.name || 'Unknown',
              description: cat.description || ''
            }));
          }
          // Format 3: Direct array
          else if (Array.isArray(response)) {
            console.log('✅ Format 3: Direct array - Found', response.length, 'categories');
            categoriesToSet = response.map((cat: any) => ({
              categoryId: cat.categoryId,
              fullName: cat.fullName || cat.categoryName || cat.name || 'Unknown',
              description: cat.description || ''
            }));
          }
          // Format 4: { data: { categories: [] } }
          else if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
            console.log('✅ Format 4: Data with categories - Found', response.data.categories.length, 'categories');
            categoriesToSet = response.data.categories.map((cat: any) => ({
              categoryId: cat.categoryId,
              fullName: cat.fullName || cat.categoryName || cat.name || 'Unknown',
              description: cat.description || ''
            }));
          }
          else {
            console.warn('⚠️ Unknown categories response format:', response);
          }
        }
        
        if (categoriesToSet.length > 0) {
          this.categories.set(categoriesToSet);
          console.log('✅ Successfully loaded', categoriesToSet.length, 'categories');
        } else {
          console.warn('⚠️ No categories found in response');
        }
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
        this.genericService.showError('Failed to load categories');
      }
    });
  }

  loadCourses() {
    this.loading.set(true);
    const categoryId = this.selectedCategory();
    const level = this.selectedLevel();
    const page = this.currentPage();
    
    console.log('📚 Loading courses with filters:', {
      categoryId: categoryId || 'All',
      level: level !== null && level !== undefined ? this.getLevelString(level) : 'All',
      page: page
    });
    
    // Use filter API instead of getMyCourses
    this.instructorService.filterCourses(
      null, // keyword (not used for now)
      categoryId || null,
      level !== null && level !== undefined ? level : null,
      null, // status (not used for now)
      page,
      10
    ).subscribe({
      next: (response: any) => {
        console.log('✅ Filter courses API Response:', response);
        console.log('📋 Response structure:', {
          hasItems: !!response?.items,
          hasData: !!response?.data,
          hasSuccess: !!response?.success,
          itemsLength: response?.items?.length || response?.data?.items?.length || 0,
          totalPages: response?.totalPages || response?.data?.totalPages,
          totalCount: response?.totalCount || response?.data?.totalCount,
          pageIndex: response?.pageIndex || response?.data?.pageIndex,
          pageSize: response?.pageSize || response?.data?.pageSize,
          responseKeys: response ? Object.keys(response) : [],
          dataKeys: response?.data ? Object.keys(response.data) : []
        });
        
        let coursesToSet: CourseModel[] = [];
        let totalPagesToSet = 1;
        
        // Handle different response formats
        if (response) {
          // Format 1: Direct PaginatedResponse { items: [], totalPages: 1, ... }
          if (response.items && Array.isArray(response.items)) {
            console.log('✅ Format 1: Direct PaginatedResponse - Found', response.items.length, 'courses');
            coursesToSet = response.items;
            totalPagesToSet = response.totalPages || 1;
          }
          // Format 2: Wrapped in ApiResponse { success: true, data: { items: [], ... } }
          else if (response.success && response.data) {
            if (response.data.items && Array.isArray(response.data.items)) {
              console.log('✅ Format 2a: ApiResponse<PaginatedResponse> - Found', response.data.items.length, 'courses');
              coursesToSet = response.data.items;
              totalPagesToSet = response.data.totalPages || 1;
            } else if (Array.isArray(response.data)) {
              console.log('✅ Format 2b: ApiResponse<Array> - Found', response.data.length, 'courses');
              coursesToSet = response.data;
              totalPagesToSet = 1;
            }
          }
          // Format 3: { data: { items: [], totalPages: 1 } } - Data without success property
          else if (response.data && !response.success) {
            if (response.data.items && Array.isArray(response.data.items)) {
              console.log('✅ Format 3: Data with items (no success) - Found', response.data.items.length, 'courses');
              coursesToSet = response.data.items;
              totalPagesToSet = response.data.totalPages || 1;
            } else if (Array.isArray(response.data)) {
              console.log('✅ Format 3b: Data as array (no success) - Found', response.data.length, 'courses');
              coursesToSet = response.data;
              totalPagesToSet = 1;
            } else {
              // Check if data itself is a PaginatedResponse
              if (response.data.items && Array.isArray(response.data.items)) {
                console.log('✅ Format 3c: Data is PaginatedResponse - Found', response.data.items.length, 'courses');
                coursesToSet = response.data.items;
                totalPagesToSet = response.data.totalPages || 1;
              }
            }
          }
          // Format 4: Direct array (fallback)
          else if (Array.isArray(response)) {
            console.log('✅ Format 4: Direct Array - Found', response.length, 'courses');
            coursesToSet = response;
            totalPagesToSet = 1;
          }
          else {
            console.warn('⚠️ Unknown response format:', response);
            console.warn('Response keys:', Object.keys(response));
            if (response.data) {
              console.warn('Data keys:', Object.keys(response.data));
              console.warn('Data content:', response.data);
            }
          }
        }
        
        // Set courses
        this.courses.set(coursesToSet);
        this.totalPages.set(totalPagesToSet);
        console.log('✅ Successfully set', coursesToSet.length, 'courses, total pages:', totalPagesToSet);
        
        if (coursesToSet.length === 0) {
          console.warn('⚠️ No courses found with current filters');
        }
        
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
    console.log('🔍 Filtering by category:', categoryId);
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1); // Reset to first page when filtering
    this.updateUrl();
    // Load courses immediately after filter change
    this.loadCourses();
  }

  filterByLevel(level: number | null) {
    console.log('🔍 Filtering by level:', level);
    this.selectedLevel.set(level);
    this.currentPage.set(1); // Reset to first page when filtering
    this.updateUrl();
    // Load courses immediately after filter change
    this.loadCourses();
  }

  updateUrl() {
    const params: any = {};
    if (this.selectedCategory()) {
      params['category'] = this.selectedCategory();
    }
    if (this.selectedLevel() !== null && this.selectedLevel() !== undefined) {
      params['level'] = this.getLevelString(this.selectedLevel()!);
    }
    if (this.currentPage() > 1) {
      params['page'] = this.currentPage();
    }
    
    console.log('🔗 Updating URL with params:', params);
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge' // Merge with existing params
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
    this.createImagePreview.set(null);
    this.showCreateModal.set(true);
  }

  openUpdateModal(course: CourseModel) {
    this.selectedCourse.set(course);
    this.updateImagePreview.set(null);
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
      this.genericService.showError('Please fill in all required fields correctly');
      return;
    }

    this.creating.set(true);
    const formValue = this.createForm.value;
    let coverImagePath: string | null = null;

    // Upload cover image if provided using Storage API
    if (formValue.coverImage) {
      try {
        console.log('📤 Uploading cover image to Storage API...');
        const uploadResponse = await this.storageService.uploadFile(formValue.coverImage, GoogleStoragePaths.Public.CourseCoverImages).toPromise();
        console.log('✅ Storage API Response:', uploadResponse);
        
        if (uploadResponse?.success && uploadResponse.publicUrl) {
          coverImagePath = uploadResponse.publicUrl;
          console.log('✅ Image uploaded successfully. Public URL:', coverImagePath);
        } else {
          console.error('❌ Upload response missing success or publicUrl:', uploadResponse);
          this.genericService.showError('Failed to upload cover image: Invalid response from server');
          this.creating.set(false);
          return;
        }
      } catch (err: any) {
        console.error('❌ Error uploading image:', err);
        this.genericService.showError(err.error?.message || 'Failed to upload cover image. Please try again.');
        this.creating.set(false);
        return;
      }
    }

    // Get instructorId from user data or JWT token
    const instructorId = this.instructorService.getInstructorId();
    if (!instructorId) {
      this.genericService.showError('Instructor ID not found. Please login again.');
      this.creating.set(false);
      return;
    }
    console.log('👤 Using instructorId:', instructorId);
    
    // Backend CourseLevel enum expects: 0 (Beginner), 1 (Intermediate), 2 (Advanced)
    // IMPORTANT: Convert level to number - form select returns string
    const levelValue = typeof formValue.level === 'string' ? parseInt(formValue.level, 10) : Number(formValue.level);
    console.log('📊 Level value from form:', formValue.level, 'Type:', typeof formValue.level);
    console.log('📊 Level value converted:', levelValue, 'Type:', typeof levelValue);
    
    // Validate level is valid (0, 1, or 2)
    if (isNaN(levelValue) || levelValue < 0 || levelValue > 2) {
      this.genericService.showError('Invalid course level. Please select a valid level.');
      this.creating.set(false);
      return;
    }
    
    const createDto: CreateCourseDto = {
      courseCode: formValue.courseCode!,
      title: formValue.title!,
      description: formValue.description || null,
      coverImagePath: coverImagePath,
      instructorId: instructorId, // Get from user data or JWT token
      categoryId: Number(formValue.categoryId), // Ensure categoryId is number
      level: levelValue, // 0, 1, or 2 - Backend expects number for CourseLevel enum
      status: null,
      price: Number(formValue.price), // Ensure price is number
      endDate: formValue.endDate ? new Date(formValue.endDate) : null
    };

    console.log('📤 Creating course with DTO:', createDto);
    console.log('📤 Request body will be:', { createCourseDto: createDto });

    this.instructorService.createCourse(createDto).subscribe({
      next: (response: any) => {
        this.creating.set(false);
        console.log('✅ Create course response:', response);
        console.log('✅ Response type check:', {
          hasSuccess: 'success' in response,
          hasData: 'data' in response,
          hasMessage: 'message' in response,
          responseKeys: Object.keys(response)
        });
        
        // Handle different response formats
        // Format 1: { success: true, message: "...", data: {...} }
        // Format 2: Direct CourseModel object
        // Format 3: { data: {...} } without success
        const isSuccess = response?.success === true || response?.success === undefined;
        const hasData = response?.data || response?.courseId || response;
        
        if (isSuccess && hasData) {
          this.genericService.showSuccess(response?.message || 'Course created successfully');
          this.showCreateModal.set(false);
          this.createForm.reset();
          this.createImagePreview.set(null);
          this.loadCourses();
        } else {
          this.genericService.showError(response?.message || 'Failed to create course');
        }
      },
      error: (err: any) => {
        this.creating.set(false);
        console.error('❌ Error creating course:', err);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
        console.error('❌ Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error,
          errors: err.error?.errors,
          message: err.error?.message,
          title: err.error?.title,
          detail: err.error?.detail
        });
        
        // Handle validation errors (400 Bad Request)
        if (err.status === 400) {
          if (err.error?.errors) {
            const validationErrors = err.error.errors;
            const errorMessages: string[] = [];
            
            // Extract validation error messages
            Object.keys(validationErrors).forEach(key => {
              const messages = validationErrors[key];
              if (Array.isArray(messages)) {
                messages.forEach((msg: string) => {
                  errorMessages.push(`${key}: ${msg}`);
                });
              } else {
                errorMessages.push(`${key}: ${messages}`);
              }
            });
            
            if (errorMessages.length > 0) {
              this.genericService.showError(`Validation errors:\n${errorMessages.join('\n')}`);
            } else {
              this.genericService.showError(err.error?.message || err.error?.detail || 'Validation failed. Please check your input.');
            }
          } else if (err.error?.message) {
            this.genericService.showError(err.error.message);
          } else if (err.error?.detail) {
            this.genericService.showError(err.error.detail);
          } else {
            this.genericService.showError('Validation failed. Please check your input and try again.');
          }
        } 
        // Handle unauthorized (401)
        else if (err.status === 401) {
          this.genericService.showError('Unauthorized. Please login again.');
        }
        // Handle forbidden (403)
        else if (err.status === 403) {
          this.genericService.showError('You do not have permission to create courses.');
        }
        // Handle server errors (500+)
        else if (err.status >= 500) {
          this.genericService.showError('Server error. Please try again later.');
        }
        // Other errors
        else {
          const errorMsg = err.error?.message || err.error?.detail || err.message || 'Failed to create course. Please try again.';
          this.genericService.showError(errorMsg);
        }
      }
    });
  }

  async onUpdateSubmit() {
    if (!this.updateForm.valid || !this.selectedCourse()) {
      this.updateForm.markAllAsTouched();
      this.genericService.showError('Please fill in all required fields correctly');
      return;
    }

    this.updating.set(true);
    const formValue = this.updateForm.value;
    const course = this.selectedCourse()!;
    let coverImagePath: string | null = course.coverImagePath;

    // Upload new cover image if provided using Storage API
    if (formValue.coverImage) {
      try {
        console.log('📤 Uploading new cover image to Storage API...');
        const uploadResponse = await this.storageService.uploadFile(formValue.coverImage, GoogleStoragePaths.Public.CourseCoverImages).toPromise();
        console.log('✅ Storage API Response:', uploadResponse);
        
        if (uploadResponse?.success && uploadResponse.publicUrl) {
          coverImagePath = uploadResponse.publicUrl;
          console.log('✅ Image uploaded successfully. Public URL:', coverImagePath);
        } else {
          console.error('❌ Upload response missing success or publicUrl:', uploadResponse);
          this.genericService.showError('Failed to upload cover image: Invalid response from server');
          this.updating.set(false);
          return;
        }
      } catch (err: any) {
        console.error('❌ Error uploading image:', err);
        this.genericService.showError(err.error?.message || 'Failed to upload cover image. Please try again.');
        this.updating.set(false);
        return;
      }
    }

    // Convert level to number - form select returns string
    const levelValue = typeof formValue.level === 'string' ? parseInt(formValue.level, 10) : Number(formValue.level);
    
    // Validate level is valid (0, 1, or 2)
    if (isNaN(levelValue) || levelValue < 0 || levelValue > 2) {
      this.genericService.showError('Invalid course level. Please select a valid level.');
      this.updating.set(false);
      return;
    }
    
    const updateDto: UpdateCourseDto = {
      title: formValue.title!,
      courseCode: formValue.courseCode!,
      description: formValue.description || null,
      coverImagePath: coverImagePath,
      categoryId: Number(formValue.categoryId), // Ensure categoryId is number
      level: levelValue, // 0, 1, or 2 - Backend expects number for CourseLevel enum
      price: Number(formValue.price), // Ensure price is number
      endDate: formValue.endDate ? new Date(formValue.endDate) : null
    };

    this.instructorService.updateCourse(course.courseId, updateDto).subscribe({
      next: (response: any) => {
        this.updating.set(false);
        console.log('✅ Update course response:', response);
        console.log('✅ Response type check:', {
          hasSuccess: 'success' in response,
          hasData: 'data' in response,
          hasMessage: 'message' in response,
          responseKeys: Object.keys(response)
        });
        
        // Handle different response formats
        // Format 1: { success: true, message: "...", data: {...} }
        // Format 2: Direct CourseModel object
        // Format 3: { data: {...} } without success
        const isSuccess = response?.success === true || response?.success === undefined;
        const hasData = response?.data || response?.courseId || response;
        
        if (isSuccess && hasData) {
          this.genericService.showSuccess(response?.message || 'Course updated successfully');
          this.showUpdateModal.set(false);
          this.updateImagePreview.set(null);
          this.loadCourses();
        } else {
          this.genericService.showError(response?.message || 'Failed to update course');
        }
      },
      error: (err: any) => {
        this.updating.set(false);
        console.error('❌ Error updating course:', err);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
        console.error('❌ Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error,
          errors: err.error?.errors,
          message: err.error?.message,
          title: err.error?.title,
          detail: err.error?.detail
        });
        
        // Handle validation errors (400 Bad Request)
        if (err.status === 400) {
          if (err.error?.errors) {
            const validationErrors = err.error.errors;
            const errorMessages: string[] = [];
            
            Object.keys(validationErrors).forEach(key => {
              const messages = validationErrors[key];
              if (Array.isArray(messages)) {
                messages.forEach((msg: string) => {
                  errorMessages.push(`${key}: ${msg}`);
                });
              } else {
                errorMessages.push(`${key}: ${messages}`);
              }
            });
            
            if (errorMessages.length > 0) {
              this.genericService.showError(`Validation errors:\n${errorMessages.join('\n')}`);
            } else {
              this.genericService.showError(err.error?.message || err.error?.detail || 'Validation failed. Please check your input.');
            }
          } else if (err.error?.message) {
            this.genericService.showError(err.error.message);
          } else if (err.error?.detail) {
            this.genericService.showError(err.error.detail);
          } else {
            this.genericService.showError('Validation failed. Please check your input and try again.');
          }
        } 
        // Handle unauthorized (401)
        else if (err.status === 401) {
          this.genericService.showError('Unauthorized. Please login again.');
        }
        // Handle forbidden (403)
        else if (err.status === 403) {
          this.genericService.showError('You do not have permission to update courses.');
        }
        // Handle server errors (500+)
        else if (err.status >= 500) {
          this.genericService.showError('Server error. Please try again later.');
        }
        // Other errors
        else {
          const errorMsg = err.error?.message || err.error?.detail || err.message || 'Failed to update course. Please try again.';
          this.genericService.showError(errorMsg);
        }
      }
    });
  }

  onDeleteSubmit() {
    const course = this.selectedCourse();
    if (!course) return;

    this.instructorService.deleteCourse(course.courseId).subscribe({
      next: (response: any) => {
        console.log('✅ Delete course response:', response);
        console.log('✅ Response type check:', {
          hasSuccess: 'success' in response,
          hasMessage: 'message' in response,
          responseKeys: Object.keys(response)
        });
        
        // Handle different response formats
        // Format 1: { success: true, message: "..." }
        // Format 2: { message: "..." } without success
        // Format 3: Empty object or null (still success if no error)
        const isSuccess = response?.success === true || response?.success === undefined;
        
        if (isSuccess) {
          this.genericService.showSuccess(response?.message || 'Course deleted successfully');
          this.showDeleteModal.set(false);
          this.loadCourses();
        } else {
          this.genericService.showError(response?.message || 'Failed to delete course');
        }
      },
      error: (err: any) => {
        console.error('❌ Error deleting course:', err);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
        console.error('❌ Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error,
          message: err.error?.message,
          detail: err.error?.detail
        });
        
        // Handle unauthorized (401)
        if (err.status === 401) {
          this.genericService.showError('Unauthorized. Please login again.');
        }
        // Handle forbidden (403)
        else if (err.status === 403) {
          this.genericService.showError('You do not have permission to delete courses.');
        }
        // Handle not found (404)
        else if (err.status === 404) {
          this.genericService.showError('Course not found.');
        }
        // Handle server errors (500+)
        else if (err.status >= 500) {
          this.genericService.showError('Server error. Please try again later.');
        }
        // Other errors
        else {
          const errorMsg = err.error?.message || err.error?.detail || err.message || 'Failed to delete course. Please try again.';
          this.genericService.showError(errorMsg);
        }
      }
    });
  }

  onStatusSubmit() {
    const course = this.selectedCourse();
    if (!course) return;

    // Toggle status: Active (3) <-> Inactive (4)
    const newStatus = course.status === 'Active' ? 4 : 3;

    this.instructorService.setCourseStatus(course.courseId, newStatus).subscribe({
      next: (response: any) => {
        console.log('✅ Update course status response:', response);
        console.log('✅ Response type check:', {
          hasSuccess: 'success' in response,
          hasMessage: 'message' in response,
          responseKeys: Object.keys(response)
        });
        
        // Handle different response formats
        // Format 1: { success: true, message: "..." }
        // Format 2: { message: "..." } without success
        // Format 3: Empty object or null (still success if no error)
        const isSuccess = response?.success === true || response?.success === undefined;
        
        if (isSuccess) {
          this.genericService.showSuccess(response?.message || `Course ${newStatus === 3 ? 'enabled' : 'disabled'} successfully`);
          this.showStatusModal.set(false);
          this.loadCourses();
        } else {
          this.genericService.showError(response?.message || 'Failed to update course status');
        }
      },
      error: (err: any) => {
        console.error('❌ Error updating course status:', err);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
        console.error('❌ Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error,
          message: err.error?.message,
          detail: err.error?.detail
        });
        
        // Handle unauthorized (401)
        if (err.status === 401) {
          this.genericService.showError('Unauthorized. Please login again.');
        }
        // Handle forbidden (403)
        else if (err.status === 403) {
          this.genericService.showError('You do not have permission to update course status.');
        }
        // Handle not found (404)
        else if (err.status === 404) {
          this.genericService.showError('Course not found.');
        }
        // Handle server errors (500+)
        else if (err.status >= 500) {
          this.genericService.showError('Server error. Please try again later.');
        }
        // Other errors
        else {
          const errorMsg = err.error?.message || err.error?.detail || err.message || 'Failed to update course status. Please try again.';
          this.genericService.showError(errorMsg);
        }
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
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.genericService.showError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.genericService.showError('Image size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (form === 'create') {
          this.createForm.patchValue({ coverImage: file });
          this.createImagePreview.set(e.target.result);
        } else {
          this.updateForm.patchValue({ coverImage: file });
          this.updateImagePreview.set(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  removeImagePreview(form: 'create' | 'update') {
    if (form === 'create') {
      this.createForm.patchValue({ coverImage: null });
      this.createImagePreview.set(null);
    } else {
      this.updateForm.patchValue({ coverImage: null });
      this.updateImagePreview.set(null);
    }
  }
}

