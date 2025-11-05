import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessful } from './payment-successful';

describe('PaymentSuccessful', () => {
  let component: PaymentSuccessful;
  let fixture: ComponentFixture<PaymentSuccessful>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccessful]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessful);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
