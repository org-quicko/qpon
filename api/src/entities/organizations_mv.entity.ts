import { Index, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'organizations_mv',
  expression: `
        with total_coupons as (
            select count(coupon_id) as total_coupons, organization_id
            from coupon
            where status != 'archive'
            group by organization_id
        ),
        total_members as (
            select count(user_id) as total_members, organization_id
            from organization_user
            where role != 'super_admin'
            group by organization_id
        ),
        total_campaigns as (
            select count(campaign_id) as total_campaigns, organization_id
            from campaign
            where status != 'archive'
            group by organization_id
        ),
        total_coupon_codes as (
            select count(coupon_code_id) as total_coupon_codes, organization_id
            from coupon_code
            where status != 'archive'
            group by organization_id
        )
        select 
            o.organization_id, 
            o.name,
            o.external_id, 
            coalesce(c.total_coupons, 0) as total_coupons,
            coalesce(camp.total_campaigns, 0) as total_campaigns,
            coalesce(cc.total_coupon_codes, 0) as total_coupon_codes,
            coalesce(ou.total_members, 0) as total_members,
            o.created_at
        from organization o
        left join total_coupons c on c.organization_id = o.organization_id
        left join total_members ou on ou.organization_id = o.organization_id
        left join total_campaigns camp on camp.organization_id = o.organization_id
        left join total_coupon_codes cc on cc.organization_id = o.organization_id;
    `,
  materialized: true,
})
export class OrganizationsMv {
  @Index()
  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @ViewColumn()
  name: string;

  @ViewColumn({ name: 'total_coupons' })
  totalCoupons: number;

  @ViewColumn({ name: 'total_campaigns' })
  totalCampaigns: number;

  @ViewColumn({ name: 'total_coupon_codes' })
  totalCouponCodes: number;

  @ViewColumn({ name: 'total_members' })
  totalMembers: number;

  @ViewColumn({ name: 'external_id' })
  externalId: string;

  @ViewColumn({ name: 'created_at' })
  createdAt: Date;
}
