import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CourseDto } from '../../models/course-dto.model';
import { CourseService } from '../../services/course-service';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { GenericServices } from '../../../../core/services/GenericServices';
import { CategoryDto } from '../../../home/models/categoryDto';
import { PaginatedResponse } from '../../../../core/models/generic-response-class';
import { CourseLevel, CourseStatus } from '../../../../core/enums/enums';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-courselist',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ tối ưu hiệu năng
})
export class Courselist implements OnInit {
  private courseService = inject(CourseService);
  private genericService = inject(GenericServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  courseList = signal<CourseDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  pageIndex = signal(1);
  pageSize = signal(5);
  totalPages = signal(0);
  totalItems = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);
  loading = signal(false);

  // Filter states
  keyword = signal<string>('');
  selectedCategoryId = signal<number | null>(null);
  selectedLevel = signal<number | null>(null);
  selectedStatus = signal<number | null>(null);

  // CourseLevel enum values for template
  CourseLevel = CourseLevel;
  courseLevelNames = ['Beginner', 'Intermediate', 'Advanced'];

  ngOnInit(): void {
    this.loadCategories();
    
    // Read query params - load courses when params change
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'] || '';
      const categoryId = params['categoryId'] ? +params['categoryId'] : null;
      const level = params['level'] !== undefined ? +params['level'] : null;
      const page = params['pageIndex'] ? +params['pageIndex'] : 1;

      this.keyword.set(keyword);
      this.selectedCategoryId.set(categoryId);
      this.selectedLevel.set(level);
      this.pageIndex.set(page);

      // Load courses when params change
      this.loadCourses();
    });
  }

  loadCategories(): void {
    this.genericService.get<any>('api/categories/all').subscribe({
      next: (res) => {
        if (res?.categories) {
          this.categories.set(res.categories);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load categories:', err);
      }
    });
  }

  loadCourses(): void {
    this.loading.set(true);

    // Single API call with all filter params (including pagination)
    const filterParams = {
      keyword: this.keyword() || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      level: this.selectedLevel() ?? undefined,
      status: this.selectedStatus() ?? undefined,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize()
    };

    this.courseService.getFiltered(filterParams).subscribe({
      next: (res: any) => {
        let paginatedData: PaginatedResponse<CourseDto> | null = null;

        // Response format from GetFilteredCoursesResponse: { data: PaginatedResponse<CourseDto> }
        if (res?.data) {
          paginatedData = res.data as PaginatedResponse<CourseDto>;
        }
        // Fallback: Direct PaginatedResponse
        else if (res?.items && Array.isArray(res.items)) {
          paginatedData = res as PaginatedResponse<CourseDto>;
        }
        // Fallback: Response wrapped in data property
        else if (res?.data?.items && Array.isArray(res.data.items)) {
          paginatedData = res.data as PaginatedResponse<CourseDto>;
        }

        if (paginatedData) {
          const courses = paginatedData.items || [];
          
          // Set courses and pagination info from API response
          this.courseList.set(courses);
          this.totalItems.set(paginatedData.totalCount || 0);
          this.pageIndex.set(paginatedData.pageIndex || 1);
          this.totalPages.set(paginatedData.totalPages || 0);
          this.hasPreviousPage.set(paginatedData.hasPreviousPage || false);
          this.hasNextPage.set(paginatedData.hasNextPage || false);
        } else {
          console.warn('⚠️ Unknown response format:', res);
          this.courseList.set([]);
          this.totalPages.set(0);
          this.totalItems.set(0);
          this.hasPreviousPage.set(false);
          this.hasNextPage.set(false);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load courses:', err);
        this.courseList.set([]);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(1);
    this.updateQueryParamsAndLoad();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageIndex.set(page);
    this.updateQueryParamsAndLoad();
  }

  updateQueryParamsAndLoad(): void {
    // Build query params - queryParams subscription will trigger loadCourses()
    const queryParams: any = {};

    if (this.keyword()) {
      queryParams.keyword = this.keyword();
    }

    if (this.selectedCategoryId() !== null && this.selectedCategoryId() !== undefined) {
      queryParams.categoryId = this.selectedCategoryId();
    }

    if (this.selectedLevel() !== null && this.selectedLevel() !== undefined) {
      queryParams.level = this.selectedLevel();
    }

    if (this.pageIndex() > 1) {
      queryParams.pageIndex = this.pageIndex();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  }

  getLevelName(level: number): string {
    return this.courseLevelNames[level] || 'Unknown';
  }

  pageNumbers = computed(() => {
    const pages: number[] = [];
    const total = this.totalPages();
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  });
}
