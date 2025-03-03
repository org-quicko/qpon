
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDto } from '../dtos';


@Injectable()
export class UserService {
  
constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>
) {}


  /**
   * Create user
   */
  async createUser(organizationId: string, @Body() body: UserDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch users
   */
  async fetchUsers(organizationId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update user
   */
  async updateUser(organizationId: string, userId: string, body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete user
   */
  async deleteUser(organizationId: string, userId: string) {
    throw new Error('Method not implemented.');
  }
}
