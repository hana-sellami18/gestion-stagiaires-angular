import { TestBed } from '@angular/core/testing';

import { Candidature } from './candidature';

describe('Candidature', () => {
  let service: Candidature;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Candidature);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
