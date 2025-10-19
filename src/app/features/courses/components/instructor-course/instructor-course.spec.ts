import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorCourse } from './instructor-course';

describe('InstructorCourse', () => {
  let component: InstructorCourse;
  let fixture: ComponentFixture<InstructorCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
