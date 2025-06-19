import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RxFormBuilder, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { OnSuccess, SetupStore } from './store/setup.store';
import { CreateUserDto } from '../../../dtos/user.dto';
import { roleEnum } from '../../../enums';

@Component({
  selector: 'app-super-admin-setup',
  imports: [
    MatFormField,
    MatLabel,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    CommonModule,
  ],
  providers: [SetupStore],
  templateUrl: './super-admin-setup.component.html',
  styleUrls: ['./super-admin-setup.component.css']
})
export class SuperAdminSetupComponent {
 hidePassword = true;
  createSuperAdminForm: FormGroup;

  setupStore = inject(SetupStore);


  error = this.setupStore.error;

  constructor(private formBuilder: RxFormBuilder, private router: Router) {
    this.createSuperAdminForm = this.formBuilder.formGroup(new CreateUserDto());
    // this.createSuperAdminForm = this.formBuilder.formGroup({
    //   name: ['', Validators.required],
    //   email: ['', [Validators.required, Validators.email]],
    //   password: ['', Validators.required]
    // });
  }

  ngOnInit() {
    OnSuccess.subscribe(() => {
      this.router.navigate(['/login'])
    })
  }

  onCreateSuperAdmin() {
    this.createSuperAdminForm.markAllAsTouched();

    if(this.createSuperAdminForm.invalid) {
      console.error(this.createSuperAdminForm.errors);
      return;
    }

    const body = new CreateUserDto();
    body.email = this.createSuperAdminForm.controls['email']?.value;
    body.password = this.createSuperAdminForm.controls['password']?.value;
    body.role = roleEnum.SUPER_ADMIN;
    body.name = this.createSuperAdminForm.controls['name']?.value;

    this.setupStore.createSuperAdmin({ body });
  }
}
