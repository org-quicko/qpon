import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginCredentialDto } from '../dtos/auth.dto';
import { LoggerService } from '../services/logger.service';
import { Public } from '../decorators/public.decorator';

@Controller('users')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: LoggerService,
  ) {}

  /**
   * Login
   */
  @Public()
  @Post('login')
  async login(@Body() body: LoginCredentialDto) {
    this.logger.info('START: login controller');

    const result = await this.authService.authenticate(body);

    this.logger.info('END: login controller');
    return { message: 'Successfully logged in user', result };
  }
}
