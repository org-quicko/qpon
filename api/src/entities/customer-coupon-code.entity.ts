import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { CouponCode } from './coupon-code.entity';

@Entity({ name: 'customer_coupon_code' })
export class CustomerCouponCode {
  @PrimaryColumn({ name: 'customer_id' })
  customerId: string;

  @PrimaryColumn({ name: 'coupon_code_id' })
  couponCodeId: string;

  @CreateDateColumn({
    type: 'time with time zone',
    default: () => `now()`,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'time with time zone',
    default: () => `now()`,
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.customerCouponCodes)
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'customerId',
  })
  customer: Customer;

  @ManyToOne(() => CouponCode, (couponCode) => couponCode.customerCouponCodes)
  @JoinColumn({
    name: 'coupon_code_id',
    referencedColumnName: 'couponCodeId',
  })
  couponCode: CouponCode;
}
