import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDrawingComponent } from './delete-drawing.component';

describe('DeleteDrawingComponent', () => {
  let component: DeleteDrawingComponent;
  let fixture: ComponentFixture<DeleteDrawingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteDrawingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
