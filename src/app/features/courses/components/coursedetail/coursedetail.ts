import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course-service';
import { CourseDto } from '../../models/course-dto.model';
import { CurrencyPipe } from '@angular/common';
import { SharedModule } from '../../../../core/shared/sharedModule';

@Component({
  selector: 'app-coursedetail',
  imports: [CurrencyPipe, SharedModule],
  templateUrl: './coursedetail.html',
  styleUrl: './coursedetail.scss'
})
export class Coursedetail {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  course = signal<CourseDto | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const courseId = String(this.route.snapshot.paramMap.get('courseId'));
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  loadCourse(id: string): void {
    this.loading.set(true);
    this.courseService.find(id).subscribe({
      next: (res : any) => {
        this.course.set(res.courseDtos);
        console.log(this.course());
      },
      error: (err) => {
        console.error('❌ Failed to load course detail:', err);
      },
      complete: () => this.loading.set(false)
    });
  }
}
