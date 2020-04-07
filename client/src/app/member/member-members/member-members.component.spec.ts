import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberMembersComponent } from './member-members.component';

describe('MemberMembersComponent', () => {
  let component: MemberMembersComponent;
  let fixture: ComponentFixture<MemberMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
