import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CreateOrganizationStore, OnMemberSuccess } from '../store/create-organization.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateUserDto } from '../../../../dtos/user.dto';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AvatarModule } from 'ngx-avatars';

@Component({
  selector: 'app-invite-team',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
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

  createOrganizationStore = inject(CreateOrganizationStore);

  createdOrganization = this.createOrganizationStore.createdOrganization;
  members = this.createOrganizationStore.members;
  isNextClicked = this.createOrganizationStore.onNext;

  constructor(private router: Router, private formBuilder: RxFormBuilder, private route: ActivatedRoute) {
    this.addMemberForm = formBuilder.formGroup(new CreateUserDto());
    this.organizationId = '';

    effect(() => {
      if(this.isNextClicked()) {
        this.createOrganizationStore.setOnNext();
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

    OnMemberSuccess.subscribe((res) => {
      if(res) {
        this.createOrganizationStore.nextStep();
        this.router.navigate([`/organizations/create/${this.organizationId}/success`]);
      }
    })
  }

  changeRole(role: string) {
    this.addMemberForm.get('role')?.setValue(role);
  }

  onSave() {

    if(!this.addMemberForm.dirty || this.addMemberForm.invalid) {
      return;
    }

    const member = new CreateUserDto();
    member.name = this.addMemberForm.value['name'];
    member.email = this.addMemberForm.value['email'];
    member.role = this.addMemberForm.value['role'];
    member.password = this.addMemberForm.value['password'];

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
