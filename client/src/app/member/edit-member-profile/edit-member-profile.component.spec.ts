import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { EditMemberProfileComponent } from "./edit-member-profile.component";

describe("EditMemberProfileComponent", () => {
  let component: EditMemberProfileComponent;
  let fixture: ComponentFixture<EditMemberProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditMemberProfileComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMemberProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
