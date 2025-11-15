import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignmentList } from './asignment-list';

describe('AsignmentList', () => {
  let component: AsignmentList;
  let fixture: ComponentFixture<AsignmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignmentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignmentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
