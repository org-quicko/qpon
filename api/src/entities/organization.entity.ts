import {
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { OrganizationUser } from './organization-user.entity';
import { Coupon } from './coupon.entity';
import { Item } from './item.entity';
import { Customer } from './customer.entity';
import { Redemption } from './redemption.entity';
import { CouponCode } from './coupon-code.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid', { name: 'organization_id' })
  organizationId: string;

  @Column()
  name: string;

  @Column()
  currency: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'theme_colour' })
  themeColour: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => `now()`,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => `now()`,
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(
    () => OrganizationUser,
    (organizationUser) => organizationUser.organization,
  )
  organizationUser: OrganizationUser[];

  @OneToMany(() => Coupon, (coupon) => coupon.organization)
  coupons: Coupon[];

  @OneToMany(() => Item, (item) => item.organization)
  items: Item[];

  @OneToMany(() => CouponCode, (couponCode) => couponCode.organization)
  couponCodes: CouponCode[];

  @OneToMany(() => Customer, (customer) => customer.organization)
  customers: Customer[];

  @OneToMany(() => Redemption, (redemption) => redemption.organization)
  redemptions: Redemption[];
}
