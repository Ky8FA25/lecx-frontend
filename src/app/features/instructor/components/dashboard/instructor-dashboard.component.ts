import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.scss']
})
export class InstructorDashboardComponent {
  dashboardData = {
    earningMonth: 12000000,
    earningDay: 1500000,
    numStudent: 120,
    rating: 4.7,
    students: [
      {
        username: 'john_doe',
        fullName: 'John Doe',
        progress: '85%',
        enrollDate: '2025-10-01 14:35'
      },
      {
        username: 'jane_smith',
        fullName: 'Jane Smith',
        progress: '67%',
        enrollDate: '2025-10-12 09:20'
      }
    ]
  };
}
