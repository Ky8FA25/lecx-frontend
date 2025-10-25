import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CourseDto } from '../../models/course-dto.model';
import { CourseService } from '../../services/course-service';
import { SharedModule } from '../../../../core/shared/sharedModule';

@Component({
  selector: 'app-courselist',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ tối ưu hiệu năng
})
export class Courselist implements OnInit {
  private courseService = inject(CourseService);

  courseList = signal<CourseDto[]>([]);
  pageIndex = signal(1);
  pageSize = signal(5);
  totalItems = signal(0);
  loading = signal(false);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(page: number = 1): void {
    this.loading.set(true);

    this.courseService.getAll(page, this.pageSize()).subscribe({
      next: (res) => {
        if (res?.courses?.items) {
          this.courseList.set(res.courses.items);
          this.totalItems.set(res.courses.totalCount || 0);
          this.pageIndex.set(res.courses.pageIndex);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load courses:', err);
      },
      complete: () => this.loading.set(false)
    });
  }
}
