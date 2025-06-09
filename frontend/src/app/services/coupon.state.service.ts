import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
  })
  export class CouponStateService {


    private reinitializeSubject = new Subject<void>();

    reinitialize$ = this.reinitializeSubject.asObservable();

    reinitialize(): void {
        setTimeout(() => {
            this.reinitializeSubject.next();
        }, 1500);
    }

}