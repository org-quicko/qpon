import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

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

  get maxValue() {
    return this.data.length > 0 ? Math.max(...this.data.map(d => d.value)) : 0;
  }
}
