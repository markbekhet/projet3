import { TestBed } from '@angular/core/testing';

import { CanvasBuilderService } from './canvas-builder.service';

describe('CanvasBuilderService', () => {
  let service: CanvasBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
