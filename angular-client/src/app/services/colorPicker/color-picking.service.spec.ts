import { TestBed } from '@angular/core/testing';

import { ColorPickingService } from './color-picking.service';

describe('ColorPickingService', () => {
  let service: ColorPickingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorPickingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
