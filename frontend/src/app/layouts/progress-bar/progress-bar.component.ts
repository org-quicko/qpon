import { animate, state, style, transition, trigger } from '@angular/animations';

import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger('fillAnimation', [
      state('*', style({ width: '{{percentage}}%' }), { params: { percentage: 0 } }),
      transition('*=>*', [
        animate('0.8s')
      ])
    ])
  ]
})
export class ProgressBarComponent{
  @Input() fillPercentage = 0;
  @Input() initialWidth = 0;
  @Input() animate: boolean = true;
  state = 'fill'

}
