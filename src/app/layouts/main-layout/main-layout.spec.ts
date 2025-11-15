import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mainlayout } from './main-layout';

describe('MainLayout', () => {
  let component: Mainlayout;
  let fixture: ComponentFixture<Mainlayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mainlayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mainlayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
