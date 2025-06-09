import { Injectable } from '@nestjs/common';
import { ApiKeyDto } from '../dtos/api-key.dto';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyConverter {
  convert(apiKey: ApiKey, secret?: string): ApiKeyDto {
    const apiKeyDto = new ApiKeyDto();

    apiKeyDto.apiKeyId = apiKey.apiKeyId;
    apiKeyDto.key = apiKey.key;

    if (secret) {
      apiKeyDto.secret = secret;
    }
    apiKeyDto.createdAt = apiKey.createdAt.toISOString();
    apiKeyDto.updatedAt = apiKey.updatedAt.toISOString();

    return apiKeyDto;
  }
}
