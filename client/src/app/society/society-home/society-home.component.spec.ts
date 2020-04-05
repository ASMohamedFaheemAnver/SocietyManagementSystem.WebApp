import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietyHomeComponent } from './society-home.component';

describe('SocietyHomeComponent', () => {
  let component: SocietyHomeComponent;
  let fixture: ComponentFixture<SocietyHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocietyHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocietyHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
