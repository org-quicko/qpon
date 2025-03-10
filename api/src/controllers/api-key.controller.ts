import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggerService } from '../services/logger.service';
import { ApiKeyService } from '../services/api-key.service';

@ApiTags('Items')
@Controller('/organizations/:organization_id/api-keys')
export class ApiKeyController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private logger: LoggerService,
  ) {}

  /**
   * Create api key
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post()
  async createApiKey(@Param('organization_id') organizationId: string) {
    this.logger.info('START: createApiKey controller');

    const result = await this.apiKeyService.createApiKey(organizationId);

    this.logger.info('END: createApiKey controller');
    return { message: 'Successfully created api key', result };
  }

  /**
   * Fetch api key
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get()
  async fetchApiKey(@Param('organization_id') organizationId: string) {
    this.logger.info('START: fetchApiKey controller');

    const result = await this.apiKeyService.fetchApiKey(organizationId);

    this.logger.info('END: fetchApiKey controller');
    return { message: 'Successfully fetched api key', result };
  }
}
