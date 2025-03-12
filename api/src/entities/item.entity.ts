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
import { CouponItem } from './coupon-item.entity';
import { Redemption } from './redemption.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' })
  itemId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { name: 'custom_fields', nullable: true })
  customFields: object;

  @Column({ name: 'external_id', nullable: true })
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

  @ManyToOne(() => Organization, (organization) => organization.items)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;

  @OneToMany(() => CouponItem, (couponItem) => couponItem.item)
  couponItems: CouponItem[];

  @OneToMany(() => Redemption, (redemption) => redemption.item)
  redemptions: Redemption[];
}
