import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UpdateUserRoleDto } from '../dtos';
import { LoggerService } from './logger.service';
import { UserConverter } from '../converters/user.converter';
import { OrganizationUser } from '../entities/organization-user.entity';
import { QueryOptionsInterface } from '../interfaces/queryOptions.interface';
import { roleEnum } from '../enums';
import { OrganizationUserConverter } from '../converters/organization-user.converter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganizationUser)
    private readonly organizationUserRepository: Repository<OrganizationUser>,
    private userConverter: UserConverter,
    private organizationUserConverter: OrganizationUserConverter,
    private datasource: DataSource,
    private logger: LoggerService,
  ) {}

  /**
   * Create user
   */
  async createUser(organizationId: string, body: CreateUserDto) {
    this.logger.info('START: createUser service');
    return this.datasource.transaction(async (manager) => {
      try {
        const existingUser = await this.fetchUserByEmail(body.email);

        const existingOrgUser = await manager.findOne(OrganizationUser, {
          where: {
            organization: {
              organizationId,
            },
            user: {
              userId: existingUser?.userId,
            },
          },
        });

        if (existingUser) {
          if (existingOrgUser) {
            this.logger.warn('User already exists');
            throw new ConflictException('User already exists');
          } else {
            const orgUserEntity = manager.create(OrganizationUser, {
              organization: {
                organizationId,
              },
              user: {
                userId: existingUser.userId,
              },
              role: body.role,
            });

            const saveOrgUser = await manager.save(
              OrganizationUser,
              orgUserEntity,
            );

            return this.userConverter.convert(existingUser, saveOrgUser);
          }
        }

        const user = manager.create(User, {
          name: body.name,
          email: body.email,
          password: body.password,
        });

        const savedUser = await manager.save(User, user);
        const orgUserEntity = manager.create(OrganizationUser, {
          organization: {
            organizationId,
          },
          user: {
            userId: savedUser.userId,
          },
          role: body.role,
        });

        const saveOrgUser = await manager.save(OrganizationUser, orgUserEntity);

        this.logger.info('END: createUser service');
        return this.userConverter.convert(savedUser, saveOrgUser);
      } catch (error) {
        this.logger.error(`Error in createUser: ${error.message}`, error);

        if (error instanceof ConflictException) {
          throw error;
        }

        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            cause: error.message,
          },
        );
      }
    });
  }

  /**
   * Fetch users
   */
  async fetchUsers(
    organizationId: string,
    queryOptions: QueryOptionsInterface,
  ) {
    this.logger.info('START: fetchUsers service');
    try {
      const whereOptions = {};

      if (queryOptions['externalId']) {
        whereOptions['externalId'] = queryOptions.externalId;
        delete queryOptions['externalId'];
      }

      const users = await this.userRepository.find({
        relations: {
          organizationUser: true,
        },
        where: {
          organizationUser: {
            organization: {
              organizationId,
            },
            role: Not(roleEnum.SUPER_ADMIN),
          },
          ...whereOptions,
        },
        ...queryOptions,
      });

      if (!users || users.length == 0) {
        this.logger.warn('Users not found');
      }

      return users.map((user) =>
        this.userConverter.convert(
          user,
          user.organizationUser.filter(
            (orgUser) => orgUser.organizationId == organizationId,
          )[0],
        ),
      );
    } catch (error) {
      this.logger.error(`Error in fetchUsers: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user
   */
  async updateUser(
    organizationId: string,
    userId: string,
    body: UpdateUserDto,
  ) {
    this.logger.info('START: updateUser service');
    try {
      const user = await this.userRepository.findOne({
        where: {
          userId,
          organizationUser: {
            organization: {
              organizationId,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn('User not found');
        throw new NotFoundException('User not found');
      }

      await this.userRepository.update({ userId }, body);

      const savedUser = await this.userRepository.findOne({
        where: {
          userId,
          organizationUser: {
            organization: {
              organizationId,
            },
          },
        },
      });

      this.logger.info('END: updateUser service');
      return this.userConverter.convert(savedUser!);
    } catch (error) {
      this.logger.error(`Error in updateUser: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    organizationId: string,
    userId: string,
    body: UpdateUserRoleDto,
  ) {
    this.logger.info('START: updateUserRole service');
    try {
      const user = await this.userRepository.findOne({
        where: {
          userId,
          organizationUser: {
            organization: {
              organizationId,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn('User not found');
        throw new NotFoundException('User not found');
      }

      await this.organizationUserRepository.update(
        {
          organization: {
            organizationId,
          },
          user: {
            userId,
          },
        },
        body,
      );

      const updatedOrgUser = await this.organizationUserRepository.findOne({
        relations: {
          user: true,
        },
        where: {
          organization: {
            organizationId,
          },
          user: {
            userId,
          },
        },
      });

      this.logger.info('END: updateUserRole service');
      return this.userConverter.convert(updatedOrgUser!.user, updatedOrgUser!);
    } catch (error) {
      this.logger.error(`Error in updateUserRole: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete user
   */
  async deleteUser(organizationId: string, userId: string) {
    this.logger.info('START: deleteUser service');
    try {
      const user = await this.userRepository.findOne({
        where: {
          userId,
          organizationUser: {
            organization: {
              organizationId,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn('User not found');
        throw new NotFoundException('User not found');
      }

      await this.userRepository.delete(userId);

      this.logger.info('END: deleteUser service');
      return this.userConverter.convert(user);
    } catch (error) {
      this.logger.error(`Error in deleteUser: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch user by email
   */
  async fetchUserByEmail(email: string) {
    this.logger.info('START: fetchUserByEmail service');
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        this.logger.warn('User not found');
      }

      this.logger.info('END: fetchUserByEmail service');
      return user;
    } catch (error) {
      this.logger.error(`Error in fetchUsersbyEmail: ${error.message}`, error);
    }
  }

  /**
   * Fetch user
   */
  async fetchUserForValidation(whereOptions: FindOptionsWhere<User> = {}) {
    this.logger.info('START: fetchUserForValidation service');
    try {
      const user = await this.userRepository.findOne({
        relations: {
          organizationUser: true,
        },
        where: {
          ...whereOptions,
        },
      });

      if (!user) {
        this.logger.warn('User not found');
      }

      this.logger.info('END: fetchUserForValidation service');
      return user;
    } catch (error) {
      this.logger.error(
        `Error in fetchUserValidation: ${error.message}`,
        error,
      );
    }
  }

  async createSuperAdmin(body: CreateUserDto) {
    this.logger.info('START: createSuperAdmin service');
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          role: roleEnum.SUPER_ADMIN,
        },
      });

      if (existingUser) {
        this.logger.warn('Super Admin already exists');
        throw new ConflictException('Super Admin already exists');
      }

      const user = this.userRepository.create({
        name: body.name,
        email: body.email,
        password: body.password,
        role: roleEnum.SUPER_ADMIN,
      });
      const savedUser = await this.userRepository.save(user);

      this.logger.info('END: createSuperAdmin service');
      return this.userConverter.convert(savedUser);
    } catch (error) {
      this.logger.error(`Error in createSuperAdmin: ${error.message}`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create super admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error.message,
        },
      );
    }
  }

  async fetchOrganizationsForUser(userId: string) {
    this.logger.info('START: fetchOrganizationsForUser service');
    try {
      const organizationUsers = await this.organizationUserRepository.find({
        relations: {
          organization: true,
        },
        where: {
          user: {
            userId,
          },
        },
      });

      if (!organizationUsers || organizationUsers.length == 0) {
        this.logger.warn('Organizations not found for user', { userId });
      }

      this.logger.info('END: fetchOrganizationsForUser service');
      return organizationUsers.map((organizationUser) =>
        this.organizationUserConverter.convert(organizationUser),
      );
    } catch (error) {
      this.logger.error(
        `Error in fetchOrganizationsForUser: ${error.message}`,
        error,
      );

      throw new HttpException(
        'Failed to fetch organizations for a user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchUser(userId: string) {
    this.logger.info('START: fetchUser service');
    try {
      const user = await this.userRepository.findOne({
        where: {
          userId,
        },
      });

      if (!user) {
        this.logger.warn('User not found');
      }

      if (!user) {
        this.logger.warn('User not found', { userId });
        throw new NotFoundException('User not found');
      }

      this.logger.info('END: fetchUser service');
      return this.userConverter.convert(user);
    } catch (error) {
      this.logger.error(`Error in fetchUser: ${error.message}`, error);
    }
  }
}
