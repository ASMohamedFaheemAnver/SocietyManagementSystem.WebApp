import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { Society } from "src/app/society.model";

import { mimeType } from "../../util/mime-type.validator";
import { SocietyService } from "../society.service";

@Component({
  selector: "app-signup-society",
  templateUrl: "./edit-society-profile.component.html",
  styleUrls: ["./edit-society-profile.component.css"],
})
export class EditSocietyProfileComponent implements OnInit {
  form: FormGroup;

  isLoading = false;
  hide = true;

  society: Society;

  imageUrl: any = "./assets/img/add-img.png";

  private societyStatusSub: Subscription;
  private societySub: Subscription;

  private phoneNumberPattern = "[+]*[0-9]{3,13}";
  private regIdPattern = "([0-9]|[a-z]|[A-Z]){3,10}";

  constructor(private societyService: SocietyService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.societyStatusSub = this.societyService
      .getSocietyStatusListenner()
      .subscribe((emittedBoolean) => {
        this.isLoading = false;
      });

    this.societySub = this.societyService
      .getSocietyUpdatedListenner()
      .subscribe((society) => {
        console.log({
          emitted:
            "editSocietyProfileComponent.ngOnInit.getSocietyUpdatedListenner",
          society: society,
        });
        this.society = society;

        this.form.patchValue({ ...this.society, image: "undefined" });
        this.imageUrl = this.society.imageUrl;
      });

    this.societyService.getSocietyProfile();

    this.form = new FormGroup({
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      regNo: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern(this.regIdPattern),
        ],
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
    this.societyStatusSub.unsubscribe();
  }

  onSignUp() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.societyService.updateSocietyProfile(this.form.value);
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
