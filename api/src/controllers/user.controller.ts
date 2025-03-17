import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, UpdateUserRoleDto } from '../dtos';
import { LoggerService } from '../services/logger.service';
import { Public } from '../decorators/public.decorator';
import { Permissions } from '../decorators/permission.decorator';
import { User } from '../entities/user.entity';
import { OrganizationUser } from '../entities/organization-user.entity';

@ApiTags('User')
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private logger: LoggerService,
  ) {}

  /**
   * Create super admin
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Public()
  @Post('/users')
  async createSuperAdmin(@Body() body: CreateUserDto) {
    this.logger.info('START: createSuperAdmin controller');

    const result = await this.userService.createSuperAdmin(body);

    this.logger.info('END: createSuperAdmin controller');
    return { message: 'Successfully created super admin', result };
  }

  /**
   * Create user
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post('/organizations/:organization_id/users')
  async createUser(
    @Param('organization_id') organizationId: string,
    @Body() body: CreateUserDto,
  ) {
    this.logger.info('START: createUser controller');

    const result = await this.userService.createUser(organizationId, body);

    this.logger.info('END: createUser controller');
    return { message: 'Successfully created user', result };
  }

  /**
   * Fetch users
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', User)
  @Get('/organizations/:organization_id/users')
  async fetchUsers(
    @Param('organization_id') organizationId: string,
    @Query('external_id') externalId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchUsers controller');

    const result = await this.userService.fetchUsers(organizationId, {
      externalId,
      skip,
      take,
    });

    this.logger.info('END: fetchUsers controller');
    return { message: 'Successfully fetched users', result };
  }

  /**
   * Update user role
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('change_role', OrganizationUser)
  @Patch('/organizations/:organization_id/users/:user_id/role')
  async updateUserRole(
    @Param('organization_id') organizationId: string,
    @Param('user_id') userId: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    this.logger.info('START: updateUserRole controller');

    const result = await this.userService.updateUserRole(
      organizationId,
      userId,
      body,
    );

    this.logger.info('END: updateUserRole controller');
    return { message: 'Successfully updated user', result };
  }

  /**
   * Update user
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', User)
  @Patch('/organizations/:organization_id/users/:user_id')
  async updateUser(
    @Param('organization_id') organizationId: string,
    @Param('user_id') userId: string,
    @Body() body: UpdateUserDto,
  ) {
    this.logger.info('START: updateUser controller');

    const result = await this.userService.updateUser(
      organizationId,
      userId,
      body,
    );

    this.logger.info('END: updateUser controller');
    return { message: 'Successfully updated user', result };
  }

  /**
   * Delete user
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('remove_user', User)
  @Delete('/organizations/:organization_id/users/:user_id')
  async deleteUser(
    @Param('organization_id') organizationId: string,
    @Param('user_id') userId: string,
  ) {
    this.logger.info('START: deleteUser controller');

    const result = await this.userService.deleteUser(organizationId, userId);

    this.logger.info('END: deleteUser controller');
    return { message: 'Successfully deleted user', result };
  }
}
