import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EditSocietyProfileComponent } from "./edit-society-profile.component";

describe("EditSocietyProfileComponent", () => {
  let component: EditSocietyProfileComponent;
  let fixture: ComponentFixture<EditSocietyProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSocietyProfileComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSocietyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
