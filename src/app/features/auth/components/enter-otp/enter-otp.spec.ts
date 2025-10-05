import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterOTP } from './enter-otp';

describe('EnterOTP', () => {
  let component: EnterOTP;
  let fixture: ComponentFixture<EnterOTP>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterOTP]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterOTP);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
