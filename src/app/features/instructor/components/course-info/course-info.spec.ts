import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorCourseInfo } from './course-info';

describe('InstructorCourseInfo', () => {
  let component: InstructorCourseInfo;
  let fixture: ComponentFixture<InstructorCourseInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorCourseInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorCourseInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

