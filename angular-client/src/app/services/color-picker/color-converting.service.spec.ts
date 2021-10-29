import { TestBed } from '@angular/core/testing';

import { ColorConvertingService } from './color-converting.service';

describe('ColorConvertingService', () => {
  let service: ColorConvertingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorConvertingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
