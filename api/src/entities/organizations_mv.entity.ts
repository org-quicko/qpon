import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity({ name: 'organizations_mv' })
export class OrganizationsMv {
@PrimaryColumn({ name: 'organization_id', type: 'uuid' })
organizationId: string;

@Index()
@Column({ type: 'varchar', nullable: true })
name: string;

@Column({ name: 'total_coupons', type: 'numeric', default: 0 })
totalCoupons: number;

@Column({ name: 'total_campaigns', type: 'numeric', default: 0 })
totalCampaigns: number;

@Column({ name: 'total_coupon_codes', type: 'numeric', default: 0 })
totalCouponCodes: number;

@Column({ name: 'total_members', type: 'numeric', default: 0 })
totalMembers: number;

@Column({ name: 'external_id', type: 'varchar', nullable: true })
externalId: string;

@Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
createdAt: Date;

@Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
updatedAt: Date;
}
