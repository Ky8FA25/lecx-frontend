import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { StudentCourse } from '../../models/studentCourse';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-course',
  imports: [SharedModule],
  templateUrl: './my-course.html',
  styleUrl: './my-course.scss'
})
export class MyCourse implements OnInit, OnDestroy {

 
  private genericService = inject(GenericServices);

  courses = signal<StudentCourse[] | null>(null);
  loading = signal<boolean>(false);
  private subscriptions = new Subscription(); 

  // Filters
  statusFilter: string = '';
  categoryFilter: string = '';
  levelFilter: string = '';

  pageIndex = 1;
  pageSize = 6;
  totalPages = 0;

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.loading.set(true);

    const filters = {
      keyword: '',
      categoryId: this.categoryFilter || null,
      level: this.levelFilter || null,
      certificateStatus: this.statusFilter || null,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    };

   const studentcourses = this.genericService.getWithFilter('/api/student-courses/courses',filters).subscribe({
      next: (res) => {
        this.courses.set(res.data?.items);
        this.totalPages = res.data?.totalPages || 1;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
    this.subscriptions.add(studentcourses);
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.loadMyCourses();
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadMyCourses();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadMyCourses();
    }
  }

    ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
