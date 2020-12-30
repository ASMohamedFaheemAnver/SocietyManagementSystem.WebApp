import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietyMemberComponent } from './society-member.component';

describe('SocietyMemberComponent', () => {
  let component: SocietyMemberComponent;
  let fixture: ComponentFixture<SocietyMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocietyMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocietyMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
