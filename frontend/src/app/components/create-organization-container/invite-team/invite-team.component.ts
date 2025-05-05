import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CreateOrganizationStore, OnMemberSuccess } from '../store/create-organization.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateUserDto, UserDto } from '../../../../dtos/user.dto';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AvatarModule } from 'ngx-avatars';
import { SnackbarService } from '../../../services/snackbar.service';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UsersStore } from '../store/users.store';

@Component({
  selector: 'app-invite-team',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AvatarModule,
    TitleCasePipe,
    NgClass,
  ],
  templateUrl: './invite-team.component.html',
  styleUrls: ['./invite-team.component.css'],
})
export class InviteTeamComponent implements OnInit {
  addMemberForm: FormGroup;
  organizationId: string;
  roles = ['admin', 'editor', 'viewer'];
  passwordLabel = 'Set Password';

  createOrganizationStore = inject(CreateOrganizationStore);
  usersStore = inject(UsersStore);

  createdOrganization = this.createOrganizationStore.createdOrganization;
  members = this.createOrganizationStore.members;
  isNextClicked = this.createOrganizationStore.onNext;
  users = this.usersStore.users;

  constructor(private router: Router, private formBuilder: RxFormBuilder, private route: ActivatedRoute, private snackbarService: SnackbarService) {
    this.addMemberForm = formBuilder.formGroup(new CreateUserDto());
    this.organizationId = '';

    effect(() => {
      if(this.isNextClicked()) {
        this.createOrganizationStore.setOnNext();
        
        if(this.members()?.length == 0 || this.members() == null) {
          this.snackbarService.openSnackBar('Add members to invite', undefined);
          return;
        }

        this.createOrganizationStore.inviteMembers({
          organizationId: this.organizationId,
          members: this.members()!,
        })
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.organizationId = params['organization_id'];
    })

    this.usersStore.fetchUsers({});

    OnMemberSuccess.subscribe((res) => {
      if(res) {
        this.createOrganizationStore.nextStep();
        this.router.navigate([`/organizations/create/${this.organizationId}/success`]);
      }
    })

    this.addMemberForm.get('email')?.valueChanges.subscribe(email => {
      const matchedUser = this.users()?.find(user => user.email === email);
      const passwordControl = this.addMemberForm.get('password');
      const nameControl = this.addMemberForm.get('name');
    
      if (matchedUser) {
        nameControl?.setValue(matchedUser.name);
        nameControl?.disable();
        passwordControl?.disable();
      } else {
        nameControl?.reset();
        nameControl?.enable();
        passwordControl?.enable(); // <== this ensures password is usable when email is manual
      }
    });
  }

  changeRole(role: string) {
    this.addMemberForm.get('role')?.setValue(role);
  }

  onSave() {
    if(!this.addMemberForm.dirty || this.addMemberForm.invalid) {
      return;
    }

    const member = new CreateUserDto();
    member.name = this.addMemberForm.controls['name'].value;
    member.email = this.addMemberForm.controls['email'].value;
    member.role = this.addMemberForm.controls['role'].value;
    member.password = this.addMemberForm.controls['password'].value ?? "";

    this.createOrganizationStore.setMember(member);
    this.addMemberForm.reset();

    Object.keys(this.addMemberForm.controls).forEach(key => {
      this.addMemberForm.get(key)?.setErrors(null);
      this.addMemberForm.get(key)?.markAsPristine();
      this.addMemberForm.get(key)?.markAsUntouched();
    });
  }

  onRemove(member: CreateUserDto) {
    this.createOrganizationStore.removeMember(member);
  }
}
