import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coursedetail } from './coursedetail';

describe('Coursedetail', () => {
  let component: Coursedetail;
  let fixture: ComponentFixture<Coursedetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coursedetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coursedetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
