import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorMyCourseComponent } from './instructor-mycourse';

describe('InstructorMyCourseComponent', () => {
  let component: InstructorMyCourseComponent;
  let fixture: ComponentFixture<InstructorMyCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorMyCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorMyCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
