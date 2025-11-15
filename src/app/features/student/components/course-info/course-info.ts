import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LectureDTO } from '../../models/lecture';
import { LectureService } from '../../services/lecture-service';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { StudentCourse } from '../../models/studentCourse';
import { Subscription } from 'rxjs';
import { StudentService } from '../../services/student-service';
import { ActivatedRoute } from '@angular/router';
import { CategoryDto } from '../../../home/models/categoryDto';

@Component({
  selector: 'app-course-info',
  imports: [SharedModule],
  templateUrl: './course-info.html',
  styleUrl: './course-info.scss'
})
export class CourseInfo implements OnInit, OnDestroy{
 
  courses = signal<StudentCourse | null>(null);
  category = signal<CategoryDto | null>(null);
  loading = signal<boolean>(false);
  private subscriptions = new Subscription(); 
  private studentservice = inject(StudentService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('courseID'));
    if (courseId) {
      console.log('Loading course detail for ID:', courseId);
      this.loadStudentCourseDetail(courseId);
    }
  }
  
  loadStudentCourseDetail(courseId: number) {
    const studentcourse = this.studentservice.getStudentCourseDetailById('api/student-courses',courseId).subscribe({
      next: (res : any) => {
        this.courses.set(res.data);
        const categoryId = res.data?.course?.categoryId;
      if (categoryId) {
        this.loadCategoryDetail(categoryId);
      }
      },
      error: (err) => {
        console.error('❌ Failed to load course detail:', err);
      }
    });
    this.subscriptions.add(studentcourse);
  }
  loadCategoryDetail(id: number) {
    const categories = this.studentservice.getCategoryDetailById('api/categories',id).subscribe({
      next: (res : any) => {
        this.category.set(res);
      },
      error: (err) => {
        console.error('❌ Failed to load course detail:', err);
      }
    });
    this.subscriptions.add(categories);
  }

   ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

 
}
