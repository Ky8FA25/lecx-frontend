import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorRegistration } from './instructor-registration';

describe('InstructorRegistration', () => {
  let component: InstructorRegistration;
  let fixture: ComponentFixture<InstructorRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
