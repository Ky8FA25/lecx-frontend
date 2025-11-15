import { TestBed } from '@angular/core/testing';

import { AsignmentService } from './asignment-service';

describe('AsignmentService', () => {
  let service: AsignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
