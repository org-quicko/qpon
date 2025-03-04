import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { LoggerService } from './logger.service';
import { LoginCredentialDto } from '../dtos';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  async authenticate(body: LoginCredentialDto) {
    this.logger.info('START: authenticate service');
    try {
      const entity = await this.validateEntity(body);

      if (!entity) {
        this.logger.warn('User not found');
        throw new UnauthorizedException('User not found');
      }

      this.logger.info('END: authenticate service');
      return await this.login(entity);
    } catch (error) {
      this.logger.error(
        `Error in authenticate service: ${error.message}`,
        error,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new HttpException(
        'Unable to authenticate user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validateEntity(body: LoginCredentialDto) {
    const user = await this.userService.fetchUserByEmail(body.email);

    if (user && (await this.comparePasswords(body.password, user.password))) {
      return user;
    }

    return null;
  }

  private async login(user: User) {
    const tokenPayload = {
      sub: user.userId,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      accessToken,
    };
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
