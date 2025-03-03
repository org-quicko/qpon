import {
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Organization } from './organization.entity';
import { CustomerCouponCode } from './customer-coupon-code.entity';
import { Redemption } from './redemption.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid', { name: 'customer_id' })
  customerId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'external_id' })
  externalId: string;

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

  @ManyToOne(() => Organization)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;

  @OneToMany(
    () => CustomerCouponCode,
    (customerCouponCode) => customerCouponCode.customer,
  )
  customerCouponCodes: CustomerCouponCode[];

  @OneToMany(() => Redemption, (redemption) => redemption.customer)
  redemptions: Redemption[];
}
