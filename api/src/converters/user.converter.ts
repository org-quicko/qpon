import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos';
import { OrganizationUser } from '../entities/organization-user.entity';

@Injectable()
export class UserConverter {
  convert(user: User, organizationUser?: OrganizationUser): UserDto {
    const userDto = new UserDto();

    userDto.userId = user.userId;
    userDto.name = user.name;
    userDto.email = user.email;
    userDto.createdAt = user.createdAt;
    userDto.updatedAt = user.updatedAt;

    if (organizationUser) {
      userDto.role = organizationUser.role;
      userDto.lastAccessedAt = organizationUser.lastAccessedAt;
    } else {
      userDto.role = user.role;
    }

    return userDto;
  }
}
