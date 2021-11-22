import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniColorPickerComponent } from './mini-color-picker.component';

describe('MiniColorPickerComponent', () => {
  let component: MiniColorPickerComponent;
  let fixture: ComponentFixture<MiniColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniColorPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
