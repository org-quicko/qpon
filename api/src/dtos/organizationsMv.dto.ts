import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class OrganizationMvDto {
  @Expose({ name: 'organization_id' })
  organizationId: string;

  @IsString()
  name: string;

  @Expose({ name: 'total_members' })
  @IsNumber()
  totalMembers: number;

  @Expose({ name: 'total_coupons' })
  @IsNumber()
  totalCoupons: number;

  @Expose({ name: 'total_campaigns' })
  @IsNumber()
  totalCampaigns: number;
  @Expose({ name: 'total_coupon_codes' })
  @IsNumber()
  totalCouponCodes: number;

  @IsOptional()
  @Expose({ name: 'external_id' })
  @IsString()
  externalId: string;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt: Date;
}
