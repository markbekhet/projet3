import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolboxViewComponent } from './toolbox-view.component';

describe('ToolboxViewComponent', () => {
  let component: ToolboxViewComponent;
  let fixture: ComponentFixture<ToolboxViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolboxViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolboxViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
