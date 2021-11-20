import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTeamListComponent } from './user-team-list.component';

describe('UserTeamListComponent', () => {
  let component: UserTeamListComponent;
  let fixture: ComponentFixture<UserTeamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTeamListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTeamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
