import { Component, inject, OnInit } from '@angular/core';
import { LectureDTO } from '../../models/lecture';
import { LectureService } from '../../services/lecture-service';
import { SharedModule } from '../../../../core/shared/sharedModule';

@Component({
  selector: 'app-course-info',
  imports: [SharedModule],
  templateUrl: './course-info.html',
  styleUrl: './course-info.scss'
})
export class CourseInfo implements OnInit{

  lectures: LectureDTO[] = [];
  private lectureService = inject(LectureService);

  ngOnInit(): void {
    this.loadLectures(34);
  }

  loadLectures(courseId: number): void {
    this.lectureService.getLecturesByCourse(courseId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.lectures = res.data.items;
          console.log('Lectures:', this.lectures);
        } else {
          console.warn('No data found or API returned null:', res.message);
        }
      },
      error: (err) => {
        console.error('Error loading lectures:', err);
      }
    });
  }
}
