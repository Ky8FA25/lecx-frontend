import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
   imports: [
    CommonModule,    
    FormsModule,         
    DecimalPipe,        
    NgClass              
  ]
})
export class CourseDetailComponent {
  courseId: number;
  course: any;
  yourReview: any;
  reviews: any[] = [];

  constructor(private route: ActivatedRoute) {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  }

  ngOnInit(): void {
    // TODO: Replace with real API call
    this.course = {
      courseID: this.courseId,
      title: 'Angular Basics',
      level: 'Beginner',
      rating: 4.2,
      numberOfRate: 20,
      numberOfStudents: 150,
      price: 0,
      coverImagePath: './assets/images/course1.jpg',
      description: 'This is a basic Angular course',
      lastUpdate: '2025-10-20',
      instructor: {
        appUser: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    };

    // Fake review data
    this.yourReview = {
      rating: 5,
      comment: 'Great course!',
      reviewID: 1,
      user: {
        profileImagePath: 'assets/images/avatar.jpg'
      }
    };

    this.reviews = [
      {
        rating: 4,
        comment: 'Very helpful',
        user: {
          firstName: 'Alice',
          lastName: 'Smith',
          profileImagePath: 'assets/images/avatar2.jpg'
        }
      },
      {
        rating: 5,
        comment: 'Excellent!',
        user: {
          firstName: 'Bob',
          lastName: 'Johnson',
          profileImagePath: 'assets/images/avatar3.jpg'
        }
      }
    ];
  }
}
