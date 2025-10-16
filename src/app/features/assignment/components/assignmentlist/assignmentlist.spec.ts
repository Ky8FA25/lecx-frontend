import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assignmentlist } from './assignmentlist';

describe('Assignmentlist', () => {
  let component: Assignmentlist;
  let fixture: ComponentFixture<Assignmentlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assignmentlist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Assignmentlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
