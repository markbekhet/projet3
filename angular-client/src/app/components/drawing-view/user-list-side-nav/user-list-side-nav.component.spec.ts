import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListSideNavComponent } from './user-list-side-nav.component';

describe('UserListSideNavComponent', () => {
  let component: UserListSideNavComponent;
  let fixture: ComponentFixture<UserListSideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserListSideNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
