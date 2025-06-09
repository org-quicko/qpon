import { Injectable } from '@nestjs/common';
import { OrganizationUserDto } from '../dtos';
import { OrganizationUser } from '../entities/organization-user.entity';

@Injectable()
export class OrganizationUserConverter {
  convert(organizationUser: OrganizationUser): OrganizationUserDto {
    const organizationUserDto = new OrganizationUserDto();

    organizationUserDto.organizationId =
      organizationUser.organization.organizationId;
    organizationUserDto.name = organizationUser.organization.name;
    organizationUserDto.role = organizationUser.role;
    organizationUserDto.createdAt = organizationUser.createdAt;
    organizationUserDto.updatedAt = organizationUser.updatedAt;

    return organizationUserDto;
  }
}
