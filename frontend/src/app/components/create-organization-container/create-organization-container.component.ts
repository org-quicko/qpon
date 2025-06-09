import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { OrganizationStore } from '../../store/organization.store';
import { MatButtonModule } from '@angular/material/button';
import { ProgressBarComponent } from '../../layouts/progress-bar/progress-bar.component';
import { CreateOrganizationStore } from './store/create-organization.store';
import { UsersStore } from './store/users.store';

@Component({
  selector: 'app-create-organization-container',
  imports: [
    RouterOutlet,
    ProgressBarComponent,
    MatDividerModule,
    MatButtonModule,
  ],
  providers: [CreateOrganizationStore, UsersStore],
  templateUrl: './create-organization-container.component.html',
  styleUrls: ['./create-organization-container.component.css'],
})
export class CreateOrganizationContainerComponent implements OnInit {

  createOrganizationStore = inject(CreateOrganizationStore);

  currentStep = this.createOrganizationStore.currentStep;

  constructor(public router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
    .subscribe(() => {
      if(this.router.url.endsWith('invite')) {
        this.createOrganizationStore.setCurrentStep(1);
      } else if(this.router.url.endsWith('success')){
        this.createOrganizationStore.setCurrentStep(2);
      }
    });
  }

  onExit() {
    this.router.navigate(['/organizations']);
  }

  getButtonText() {
    if(this.currentStep() == 0) {
      return "Create";
    }

    if(this.currentStep() == 1) {
      return "Save";
    }

    if(this.currentStep() == 2) {
      return "Launch Organisation"
    }
    
    return 'Continue';
  }

  onContinue() {
    this.createOrganizationStore.setOnNext();
  }

  getFillPercentage1() {
    if(this.currentStep() >= 0) {
      return 100;
    }
    return 0;
  }

  getFillPercentage2() {
    if(this.currentStep() >= 1) {
      return 100;
    }

    return 0;
  }
  getFillPercentage3() {
    if(this.currentStep() >= 2) {
      return 100;
    }

    return 0;
  }

  onSkip() {
    this.router.navigate([`/organizations/create/${this.createOrganizationStore.createdOrganization()?.organizationId}/success`])
  }
}
