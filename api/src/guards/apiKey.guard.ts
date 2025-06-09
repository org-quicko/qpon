import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoggerService } from '../services/logger.service';
import { ApiKeyService } from '../services/api-key.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext) {
    this.logger.info(`START: canActivate function - ApiKeyGuard`);

    const request: Request = context.switchToHttp().getRequest();

    const key: string = request.headers['x-api-key'] as string;
    const secret: string = request.headers['x-api-secret'] as string;

    const apiKey = await this.apiKeyService.validateKeyAndSecret(key, secret);
    if (apiKey) {
      request.headers.api_key_id = apiKey.apiKeyId;
      request.headers.organization_id = apiKey.organization.organizationId;
      this.logger.info(
        `END: canActivate function - ApiKeyGuard (authenticated via API Key)`,
      );
      return true;
    }
    this.logger.error('Invalid API key or secret.');
    throw new UnauthorizedException('Invalid API key or secret.');
  }
}
