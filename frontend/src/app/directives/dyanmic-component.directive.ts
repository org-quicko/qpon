import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dyanmic-host]'
})
export class DyanmicComponentDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
