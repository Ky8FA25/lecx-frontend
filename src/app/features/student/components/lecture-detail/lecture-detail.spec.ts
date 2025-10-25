import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureDetail } from './lecture-detail';

describe('LectureDetail', () => {
  let component: LectureDetail;
  let fixture: ComponentFixture<LectureDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectureDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LectureDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
