import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course-service';
import { CourseDto } from '../../models/course-dto.model';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-coursedetail',
  imports: [SharedModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})
export class Coursedetail implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  private apiUrl = environment.apiFEUrl;
  course = signal<CourseDto | null>(null);
  loading = signal(true);
  enrolled = signal(false);
  free = signal(false);
  ngOnInit(): void {
    const courseId = String(this.route.snapshot.paramMap.get('courseId'));
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  
 

checkEnrollment(courseId: string) {
    this.courseService.isEnrolled(courseId).subscribe({
      next: (res : any) => {
        this.enrolled.set(res.isEnrolled); // true nếu đã đăng ký
        this.free.set(res.isFree); // true nếu đã đăng ký
      },
      error: (err) => console.error(err)
    });
  }
  private loadCourse(id: string): void {
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

  payloads: any;

  buyCourse(): void 
  {   
    this.payloads = {
    courseId: this.course()?.courseId,
    returnUrl: this.apiUrl + '/payments/successful',
    cancelUrl: this.apiUrl + '/payments/failed'
  };
    console.log('🚀 Checking enrollment for course ID:', this.payloads.courseId);
    console.log('🚀 Initiating course purchase with payload:', this.payloads);
    this.courseService.buyCourse(this.payloads).subscribe({
      next: (res : any) => {
        console.log('✅ Course purchased successfully:', res);
        // this.enrolled.set(true); 
        window.location.href = res.checkoutUrl;
      },
      error: (err) => {
        console.error('❌ Failed to purchase course:', err);
      }
    });
  }
}
