import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { OrganizationStore } from '../../../store/organization.store';
import { MatDividerModule } from '@angular/material/divider';
import { ProgressBarComponent } from '../../../layouts/progress-bar/progress-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { CustomerStore } from './store/customer.store';

@Component({
  selector: 'app-create-customers-container',
  imports: [
    RouterOutlet,
    ProgressBarComponent,
    MatDividerModule,
    MatButtonModule,
  ],
  providers: [CustomerStore],
  templateUrl: './create-customers-container.component.html',
  styleUrls: ['./create-customers-container.component.css'],
})
export class CreateCustomersContainerComponent {
  redirectUri: string;
  hideBackButton = signal<boolean>(false);

  organizationStore = inject(OrganizationStore);
  customerStore = inject(CustomerStore);
  organization = this.organizationStore.organizaiton;
  currentStep = this.customerStore.currentStep;
  isLoading = this.customerStore.isLoading;

  constructor(private router: Router) {
    this.redirectUri = '';

    effect(() => {
      if(this.currentStep() == 0) {
        this.hideBackButton.set(true);
      } else {
        this.hideBackButton.set(false);
      }
    })
  }

  getFillPercentage() {
    if(this.currentStep() == 0) {
      return 50;
    }

    return 100;
  }

  onExit() {
    this.router.navigate([
      `/${this.organization()?.organizationId}/home/customers`,
    ]);
  }

  onNext() {
    this.customerStore.setOnNext();
  }

  onBack() {
    this.customerStore.setOnBack();
  }

  getButtonText() {
    if(this.currentStep() == 1) {
      return "Save";
    }

    return 'Next';
  }
}
