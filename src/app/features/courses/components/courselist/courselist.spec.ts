import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Courselist } from './courselist';

describe('Courselist', () => {
  let component: Courselist;
  let fixture: ComponentFixture<Courselist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Courselist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Courselist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
