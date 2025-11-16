import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorMaterialList } from './material-list';

describe('InstructorMaterialList', () => {
  let component: InstructorMaterialList;
  let fixture: ComponentFixture<InstructorMaterialList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorMaterialList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorMaterialList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

