import { Injectable } from '@nestjs/common';
import { OrganizationMvDto } from '../dtos';
import { OrganizationsMv } from '../entities/organizations_mv.entity';

@Injectable()
export class OrganizationMvConverter {
  convert(organizationMv: OrganizationsMv): OrganizationMvDto {
    const organizationMvDto = new OrganizationMvDto();

    organizationMvDto.organizationId = organizationMv.organizationId;
    organizationMvDto.name = organizationMv.name;
    organizationMvDto.totalMembers = organizationMv.totalMembers;
    organizationMvDto.totalCoupons = organizationMv.totalCoupons;
    organizationMvDto.totalCampaigns = organizationMv.totalCampaigns;
    organizationMvDto.totalCouponCodes = organizationMv.totalCouponCodes;
    organizationMvDto.externalId = organizationMv.externalId;
    organizationMvDto.createdAt = organizationMv.createdAt;

    return organizationMvDto;
  }
}
