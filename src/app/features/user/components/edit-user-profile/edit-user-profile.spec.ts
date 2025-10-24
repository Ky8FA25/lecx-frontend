import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserProfile } from './edit-user-profile';

describe('EditUserProfile', () => {
  let component: EditUserProfile;
  let fixture: ComponentFixture<EditUserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
