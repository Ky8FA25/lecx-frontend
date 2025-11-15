import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Lecture {
  id: number;
  title: string;
}

@Component({
  selector: 'app-courselayout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './courselayout.html',
  styleUrls: ['./courselayout.scss']
})
export class Courselayout implements OnInit {
  lectures: Lecture[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.lectures = [
      { id: 1, title: 'Lecture 1: Introduction to JavaScript' },
      { id: 2, title: 'Lecture 2: Functions and Scope' },
      { id: 3, title: 'Lecture 3: DOM Manipulation' }
    ];
  }

  goToLecture(id: number) {
    this.router.navigate(['/instructor/lectures', id]);
  }
}
