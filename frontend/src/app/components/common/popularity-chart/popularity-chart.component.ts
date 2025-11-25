import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router } from "@angular/router";
import { OrganizationStore } from '../../../store/organization.store';

@Component({
  selector: 'app-popularity-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './popularity-chart.component.html',
})
export class PopularityChartComponent {
  @Input() title!: string;
  @Input() labelColumn = 'Label';
  @Input() valueColumn = 'Value';
  @Input() data: { label: string; value: number }[] = [];

  @Input() navigationText?: string;
  @Input() navigationLink?: string;

  get maxValue() {
    return this.data.length > 0 ? Math.max(...this.data.map(d => d.value)) : 0;
  }

  get showNavigation() {
    return this.navigationText && this.navigationLink;
  }

  organizationsStore = inject(OrganizationStore);

  constructor(private router: Router) { }

  onNavigate() {
    const id = this.organizationsStore.organizaiton()?.organizationId;
    this.router.navigate([`/${id}/home/dashboard/${this.navigationLink}`]);
  }
}
