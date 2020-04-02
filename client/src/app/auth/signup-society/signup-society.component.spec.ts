import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSocietyComponent } from './signup-society.component';

describe('SignupSocietyComponent', () => {
  let component: SignupSocietyComponent;
  let fixture: ComponentFixture<SignupSocietyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupSocietyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupSocietyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
