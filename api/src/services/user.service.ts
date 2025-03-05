import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { LoggerService } from './logger.service';
import { UserConverter } from '../converters/user.converter';
import { OrganizationUser } from '../entities/organization-user.entity';
import { QueryOptionsInterface } from '../interfaces/queryOptions.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganizationUser)
    private readonly organizationUserRepository: Repository<OrganizationUser>,
    private userConverter: UserConverter,
    private logger: LoggerService,
  ) {}

  /**
   * Create user
   */
  async createUser(organizationId: string, body: CreateUserDto) {
    this.logger.info('START: createUser service');
    try {
      const existingUser = await this.fetchUserByEmail(body.email);

      if (existingUser) {
        this.logger.warn('User already exists');
        throw new ConflictException('User already exists');
      }

      const user = this.userRepository.create({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
      });
      const savedUser = await this.userRepository.save(user);
      const orgUserEntity = this.organizationUserRepository.create({
        organization: {
          organizationId,
        },
        user: {
          userId: savedUser.userId,
        },
        role: body.role,
      });

      const saveOrgUser =
        await this.organizationUserRepository.save(orgUserEntity);

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
        where: {
          organizationUser: {
            organization: {
              organizationId,
            },
          },
          ...whereOptions,
        },
        ...queryOptions,
      });

      if (!users || users.length == 0) {
        this.logger.warn('Users not found');
        throw new NotFoundException(
          `Users not found for organization: ${organizationId}`,
        );
      }

      return users.map((user) => this.userConverter.convert(user));
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
}
