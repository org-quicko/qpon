import {
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Index,
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

  @Index()
  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'external_id', nullable: true })
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

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', cascade: ['remove'] })
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
