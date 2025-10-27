import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseInfo } from './course-info';

describe('CourseInfo', () => {
  let component: CourseInfo;
  let fixture: ComponentFixture<CourseInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
