import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { CreateCourseModalComponent } from './create-course-modal.component';

@Component({
  selector: 'app-instructor-mycourse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule,
    CreateCourseModalComponent
  ],
  templateUrl: './instructor-mycourse.html',
  styleUrls: ['./instructor-mycourse.scss']
})
export class InstructorMyCourseComponent {
  constructor(private modalService: NgbModal) {}

  category = '';
  level = '';
  categories = [
    { id: '1', name: 'Programming' },
    { id: '2', name: 'Finance' }
  ];

  courses = [
    {
      courseID: 1,
      coverImagePath: './assets/images/course1.jpg',
      title: 'Angular Basics',
      level: 'beginner',
      status: true,
      instructor: {
        appUser: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    },
    {
      courseID: 2,
      coverImagePath: './assets/images/course2.jpg',
      title: 'Advanced Angular',
      level: 'advanced',
      status: false,
      instructor: {
        appUser: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    }
  ];

  openCreateModal() {
    const modalRef = this.modalService.open(CreateCourseModalComponent, { size: 'lg' });
    modalRef.result.then((newCourse: any) => {
      if (newCourse) {
        this.courses.push({
          ...newCourse,
          courseID: this.courses.length + 1,
          coverImagePath: 'assets/images/default-course.jpg',
          status: true,
          instructor: {
            appUser: { firstName: 'You', lastName: '👨‍🏫' }
          }
        });
      }
    }).catch(() => {});
  }

  filterByCategory() {
    // Optional logic
    console.log('Filter by:', this.category, this.level);
  }

  viewDetails(course: any) {
    console.log('Viewing course:', course);
  }

  openUpdateModal(course: any) {
  const modalRef = this.modalService.open(CreateCourseModalComponent, { size: 'lg' });
  modalRef.componentInstance.courseData = course;

  modalRef.result.then((updatedCourse: any) => {
    if (updatedCourse) {
      const index = this.courses.findIndex(c => c.courseID === course.courseID);
      if (index !== -1) {
        this.courses[index] = {
          ...this.courses[index],
          ...updatedCourse,
          coverImagePath: updatedCourse.coverImage
            ? URL.createObjectURL(updatedCourse.coverImage) // preview ảnh tạm thời
            : updatedCourse.coverImagePath
        };
      }
    }
  }).catch(() => {});
}

  toggleStatus(course: any) {
    course.status = !course.status;
  }

  deleteCourse(course: any) {
    this.courses = this.courses.filter(c => c.courseID !== course.courseID);
  }
}
