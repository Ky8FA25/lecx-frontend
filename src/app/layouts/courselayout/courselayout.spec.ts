import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Courselayout } from './courselayout';

describe('Courselayout', () => {
  let component: Courselayout;
  let fixture: ComponentFixture<Courselayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Courselayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Courselayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
