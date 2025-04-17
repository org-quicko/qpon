import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProgressBarComponent } from '../../../layouts/progress-bar/progress-bar.component';
import { OrganizationStore } from '../../../store/organization.store';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ItemStore } from './create-items/store/item.store';

@Component({
  selector: 'app-items-container',
  imports: [
    RouterOutlet,
    ProgressBarComponent,
    MatButtonModule,
    MatDividerModule,
  ],
  providers: [ItemStore],
  templateUrl: './items-container.component.html',
  styleUrls: ['./items-container.component.css'],
})
export class ItemsContainerComponent {
  redirectUri: string;
  hideBackButton = signal<boolean>(false);

  organizationStore = inject(OrganizationStore);
  itemStore = inject(ItemStore);

  organization = this.organizationStore.organizaiton;
  currentStep = this.itemStore.currentStep;

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
    if(this.currentStep() ==0) {
      return 50;
    }

    return 100;
  }

  onExit() {
    this.router.navigate([`/${this.organization()?.organizationId}/home/items`])
  }

  onNext() {
    this.itemStore.setOnNext();
  }

  onBack() {
    this.itemStore.setOnBack();
  }

  getButtonText() {
    if(this.currentStep() == 1) {
      return "Save";
    }
    return 'Next';
  }
}
