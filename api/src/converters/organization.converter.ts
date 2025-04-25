import { Injectable } from '@nestjs/common';
import { Organization } from '../entities/organization.entity';
import { OrganizationDto } from '../dtos';

@Injectable()
export class OrganizationConverter {
  convert(organization: Organization): OrganizationDto {
    const organizationDto = new OrganizationDto();

    organizationDto.organizationId = organization.organizationId;
    organizationDto.name = organization.name;
    organizationDto.currency = organization.currency;
    organizationDto.externalId = organization.externalId;
    organizationDto.createdAt = organization.createdAt;
    organizationDto.updatedAt = organization.updatedAt;

    return organizationDto;
  }
}
