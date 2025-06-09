import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dtos';
import { PaginatedList } from 'src/dtos/paginated-list.dto';
import { UserConverter } from './user.converter';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserListConverter {
  convert(
    users: User[],
    count: number,
    skip?: number,
    take?: number,
  ): PaginatedList<UserDto> {
    const userConverter = new UserConverter();

    const usersList = users.map((user) => userConverter.convert(user));

    return PaginatedList.Builder.build(usersList, skip ?? 0, take ?? 10, count);
  }
}
