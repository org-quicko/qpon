import { discountTypeEnum, itemConstraintEnum } from 'src/enums';
import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  ViewEntity,
} from 'typeorm';

@ViewEntity({
  name: 'offer',
  expression: `
    SELECT 
        c.coupon_id,
        cc.code,
        c.discount_type,
        c.discount_value,
        c.item_constraint,
        cc.minimum_amount,
        cc.expires_at,
        now() as created_at,
        now() as updated_at
    FROM coupon c
    JOIN coupon_code cc ON c.coupon_id = cc.coupon_id;
    `,
})
export class Offer {
  @PrimaryColumn({ name: 'coupon_id' })
  couponId: string;

  @Column()
  code: string;

  @Column('enum', { name: 'discount_type', enum: discountTypeEnum })
  discountType: discountTypeEnum;

  @Column('numeric', { name: 'discount_value' })
  discountValue: number;

  @Column('enum', { name: 'item_constraint', enum: itemConstraintEnum })
  itemConstraint: itemConstraintEnum;

  @Column('numeric', { name: 'minimum_amount' })
  minimumAmount: number;

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
}
