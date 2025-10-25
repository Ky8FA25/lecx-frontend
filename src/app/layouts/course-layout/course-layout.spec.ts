import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseLayout } from './course-layout';

describe('CourseLayout', () => {
  let component: CourseLayout;
  let fixture: ComponentFixture<CourseLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
