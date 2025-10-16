import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mycourse } from './mycourse';

describe('Mycourse', () => {
  let component: Mycourse;
  let fixture: ComponentFixture<Mycourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mycourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mycourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
