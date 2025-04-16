import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CouponCodeStore, CreateSuccess } from '../../store/coupon-code.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OrganizationStore } from '../../../../store/organization.store';
import { MatIconModule } from '@angular/material/icon';
import { itemConstraintEnum } from '../../../../../enums';
import { NgClass } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ItemsStore } from '../../../../store/items.store';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CreateCouponItemDto } from '../../../../../dtos/coupon-item.dto';
import { MatSelectModule } from '@angular/material/select';
import { ItemDto } from '../../../../../dtos/item.dto';
import { MatRadioModule } from '@angular/material/radio';
import { UpdateCouponDto } from '../../../../../dtos/coupon.dto';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-items',
  imports: [
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './edit-items.component.html',
  styleUrls: ['./edit-items.component.css'],
})
export class EditItemsComponent implements OnInit {
  couponId: string;
  itemConstraint: string = 'all';
  selectedItems: ItemDto[];
  eligibleItems: CreateCouponItemDto;
  updateCoupon: UpdateCouponDto;
  couponUpdateForm: FormGroup;
  eligibleItemsForm: FormGroup;
  searchControl: FormControl;
  redirectUri: string;

  couponCodeStore = inject(CouponCodeStore);
  organizationStore = inject(OrganizationStore);
  itemsStore = inject(ItemsStore);

  organization = this.organizationStore.organizaiton;
  items = this.itemsStore.items;
  coupon = this.couponCodeStore.coupon.data;
  isNextClicked = this.couponCodeStore.onNext;
  isBackClicked = this.couponCodeStore.onBack;
  couponItems = this.couponCodeStore.couponItems.data

  @ViewChild('itemsInput') itemsInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: RxFormBuilder
  ) {
    this.couponId = '';
    this.selectedItems = [];
    this.eligibleItems = new CreateCouponItemDto();
    this.updateCoupon = new UpdateCouponDto();
    this.eligibleItemsForm = formBuilder.formGroup(this.eligibleItems);
    this.couponUpdateForm = formBuilder.formGroup(this.updateCoupon);
    this.searchControl = new FormControl('');
    this.redirectUri = '';

    effect(() => {
      if (this.isNextClicked()) {
        this.couponCodeStore.setOnNext();
        this.updateCouponWithItems();
        CreateSuccess.subscribe((res) => {
          if(res) {
            if(this.redirectUri) {
              this.router.navigate([atob(this.redirectUri)]);
            } else {
              this.couponCodeStore.nextStep();
              this.router.navigate(['../../campaigns'], { relativeTo: this.route });
            }
            }
        });
      }
    });

    effect(() => {
      if(this.isBackClicked()) {
        this.couponCodeStore.setOnBack();
        this.couponCodeStore.previousStep();
        this.router.navigate([`../../edit`], { relativeTo: this.route })
      }
    })

    effect(() => {
      if(this.couponItems()?.length! > 0) {
        this.selectedItems = this.couponItems()!
      }

      if(this.coupon()) {
        this.itemConstraint = this.coupon()?.itemConstraint! == itemConstraintEnum.ALL ? 'all' : 'specific'
        this.couponUpdateForm.get('itemConstraint')?.setValue(this.itemConstraint)
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.couponId = params['coupon_id'];
    });

    this.couponCodeStore.fetchCoupon({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.redirectUri = params['redirect'];

      if(this.redirectUri) {
        this.couponCodeStore.fetchItemsForCoupon({
          organizationId: this.organization()?.organizationId!,
          couponId: this.couponId
        })
      }
    })


    if (this.items().length == 0) {
      this.itemsStore.fetchItems({
        organizationId: this.organization()?.organizationId!,
      });
    }

    this.searchControl.valueChanges.subscribe((value) => {
      this.itemsStore.fetchItems({
        organizationId: this.organization()?.organizationId!,
        filter: {
          query: value.trim()
        }
      })
    })
  }

  displayWithItems = () => '';

  selectedItem(item: ItemDto) {
    const index = this.selectedItems.indexOf(item);
    if (index == -1) {
      this.selectedItems.push(item);
    } else if (index !== -1) {
      this.selectedItems.splice(index, 1);
    }
    this.itemsInput.nativeElement.value = '';
    this.eligibleItemsForm.get('items')?.setValue(null);
  }

  updateCouponWithItems() {
    this.couponCodeStore.configureCouponItems({
      organizationId: this.organization()?.organizationId!,
      couponId: this.couponId,
      itemConstraint:
        this.couponUpdateForm.get('itemConstraint')?.value == 'all'
          ? itemConstraintEnum.ALL
          : itemConstraintEnum.SPECIFIC,
      items: this.selectedItems.map((item) => item.itemId!),
      update: this.redirectUri.length > 0 ? true : false
    });
  }

  isItemSelected(item: ItemDto): boolean {
    return this.selectedItems.some(selected => selected.itemId === item.itemId);
  }
}
