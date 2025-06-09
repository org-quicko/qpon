import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  RxFormBuilder,
  RxReactiveFormsModule,
} from '@rxweb/reactive-form-validators';
import { LoginCredentialDto } from '../../../dtos/auth.dto';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginStore, onSignInSuccess } from './store/login.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
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
  providers: [LoginStore],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  hidePassword = true;
  loginFormGroup: FormGroup;
  loginCredentials: LoginCredentialDto;

  loginStore = inject(LoginStore);

  error = this.loginStore.error;

  constructor(private formBuilder: RxFormBuilder, private router: Router) {
    this.loginCredentials = new LoginCredentialDto();
    this.loginFormGroup = this.formBuilder.formGroup(new LoginCredentialDto());
  }

  ngOnInit() {
    onSignInSuccess.subscribe((success) => {
      this.router.navigate(['/organizations'])
    })
  }

  onLogin() {
    this.loginFormGroup.markAllAsTouched();
    
    if(this.loginFormGroup.invalid) {
      return;
    }

    this.loginCredentials.email = this.loginFormGroup.controls['email'].value;
    this.loginCredentials.password =
      this.loginFormGroup.controls['password'].value;

    this.loginStore.login({
      email: this.loginCredentials.email!,
      password: this.loginCredentials.password!,
    });
  }
}
