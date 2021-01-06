import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { Member } from "src/app/member.model";

import { mimeType } from "../../util/mime-type.validator";
import { MemberService } from "../member.service";

@Component({
  selector: "app-edit-member-profile",
  templateUrl: "./edit-member-profile.component.html",
  styleUrls: ["./edit-member-profile.component.css"],
})
export class EditMemberProfileComponent implements OnInit {
  form: FormGroup;

  isLoading = false;
  hide = true;

  member: Member;

  imageUrl: any = "./assets/img/add-img.png";

  private memberStatusSub: Subscription;
  private memberSub: Subscription;

  private phoneNumberPattern = "[+]*[0-9]{3,13}";

  constructor(private memberService: MemberService) {}

  ngOnInit(): void {
    // this.isLoading = true;
    this.memberStatusSub = this.memberService
      .getMemberStatusListenner()
      .subscribe((emittedBoolean) => {
        this.isLoading = false;
      });

    this.memberSub = this.memberService
      .getMemberUpdateListener()
      .subscribe((member) => {
        console.log({
          emitted:
            "editSocietyProfileComponent.ngOnInit.getSocietyUpdatedListenner",
          member: member,
        });
        this.member = member;

        this.form.patchValue({ ...this.member, image: "undefined" });
        this.imageUrl = this.member.imageUrl;
      });

    this.memberService.getMemberProfile();

    this.form = new FormGroup({
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      address: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      phoneNumber: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern(this.phoneNumberPattern),
        ],
      }),
    });
  }

  ngOnDestroy() {
    this.memberStatusSub.unsubscribe();
    this.memberSub.unsubscribe();
  }

  onSignUp() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.memberService.updateMemberProfile(this.form.value);
  }

  onImageUpload(event: Event) {
    const file: File = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();

    this.form.get("image").statusChanges.subscribe((_) => {
      if (!this.form.get("image").valid) {
        this.imageUrl = "./assets/img/invalid-img.jpg";
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.imageUrl = reader.result;
        this.form.get("image").markAsDirty();
      };
    });
  }
}
