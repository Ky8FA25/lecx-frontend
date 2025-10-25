import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoTest } from './do-test';

describe('DoTest', () => {
  let component: DoTest;
  let fixture: ComponentFixture<DoTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
