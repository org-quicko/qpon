import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UserDto } from '../dtos';

@ApiTags('User')
@Controller('/organizations/:organization_id/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create user
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post()
  async createUser(
    @Param('organization_id') organizationId: string,
    @Body() body: UserDto,
  ) {
    return this.userService.createUser(organizationId, body);
  }

  /**
   * Fetch users
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get()
  async fetchUsers(@Param('organization_id') organizationId: string) {
    return this.userService.fetchUsers(organizationId);
  }

  /**
   * Update user
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(':user_id')
  async updateUser(
    @Param('organization_id') organizationId: string,
    @Param('user_id') userId: string,
    @Body() body: any,
  ) {
    return this.userService.updateUser(organizationId, userId, body);
  }

  /**
   * Delete user
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Delete(':user_id')
  async deleteUser(
    @Param('organization_id') organizationId: string,
    @Param('user_id') userId: string,
  ) {
    return this.userService.deleteUser(organizationId, userId);
  }
}
