import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user.controller';
import { User } from '../entities/user.entity';
import { UserConverter } from '../converters/user.converter';
import { OrganizationUser } from '../entities/organization-user.entity';
import { OrganizationUserConverter } from '../converters/organization-user.converter';
import { UserListConverter } from 'src/converters/user-list.converter';

@Module({
  imports: [TypeOrmModule.forFeature([User, OrganizationUser])],
  controllers: [UserController],
  providers: [
    UserService,
    UserConverter,
    OrganizationUserConverter,
    UserListConverter,
  ],
  exports: [UserService],
})
export class UserModule {}
