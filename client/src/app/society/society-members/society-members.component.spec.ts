import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietyMembersComponent } from './society-members.component';

describe('SocietyMembersComponent', () => {
  let component: SocietyMembersComponent;
  let fixture: ComponentFixture<SocietyMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocietyMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocietyMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
