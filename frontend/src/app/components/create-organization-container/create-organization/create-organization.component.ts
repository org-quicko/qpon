import { Component, effect, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyList } from '../../../utils/currency-list-util';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CreateOrganizationStore, OnCreateOrganizationSuccess } from '../store/create-organization.store';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { Router } from '@angular/router';
import { CreateOrganizationDto } from '../../../../dtos/organization.dto';
import { instanceToPlain } from 'class-transformer';

@Component({
  selector: 'app-create-organization',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.css'],
})
export class CreateOrganizationComponent implements OnInit {
  currencyList = CurrencyList;
  createOrganizationForm: FormGroup;

  createOrganizationStore = inject(CreateOrganizationStore);
  isNextClicked = this.createOrganizationStore.onNext;

  constructor(private formBuilder: RxFormBuilder, private router: Router) {
    this.createOrganizationForm = formBuilder.formGroup(new CreateOrganizationDto())

    effect(() => {
      if(this.isNextClicked()) {
        this.createOrganizationStore.setOnNext();
        this.createOrganizationForm.markAllAsTouched();

        if(this.createOrganizationForm.invalid) {
          return;
        }
        const createOrganization = new CreateOrganizationDto();
        createOrganization.name = this.createOrganizationForm.value['name'];
        createOrganization.currency = this.createOrganizationForm.value['currency'];
        createOrganization.externalId = this.createOrganizationForm.value['externalId'];

        this.createOrganizationStore.createOrganization({
          body: instanceToPlain(createOrganization)
        })
      }
    })
  }

  ngOnInit() {
    OnCreateOrganizationSuccess.subscribe((res) => {
      if(res) {
        this.createOrganizationStore.nextStep();
        this.router.navigate([`/organizations/create/${this.createOrganizationStore.createdOrganization()?.organizationId}/invite`])
      }
    })
  }
}
