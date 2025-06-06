import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ApiKey } from '../entities/api-key.entity';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { ApiKeyConverter } from '../converters/api-key.converter';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    private apiKeyConverter: ApiKeyConverter,
    private logger: LoggerService,
  ) {}

  async createApiKey(organizationId: string) {
    this.logger.info('START: createApiKey service');
    try {
      const key = crypto.randomBytes(16).toString('hex');
      const secret = crypto.randomBytes(32).toString('hex');

      const existingApiKey = await this.apiKeyRepository.findOne({
        where: {
          organization: {
            organizationId,
          },
        },
      });

      if (existingApiKey) {
        await this.apiKeyRepository.delete(existingApiKey.apiKeyId);
      }

      const apiKeyEntity = this.apiKeyRepository.create({
        key,
        secret,
        organization: {
          organizationId,
        },
      });

      const savedApiKey = await this.apiKeyRepository.save(apiKeyEntity);

      this.logger.info('END: createApiKey service');
      return this.apiKeyConverter.convert(savedApiKey, secret);
    } catch (error) {
      this.logger.error(`Error in createApiKey:`, error);

      throw new HttpException(
        'Failed to create api key',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchApiKey(organizationId: string) {
    this.logger.info('START: fetchApiKey service');
    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: {
          organization: {
            organizationId,
          },
        },
      });

      if (!apiKey) {
        this.logger.warn('Api Key not found');
        throw new NotFoundException('Api key not found');
      }

      this.logger.info('END: fetchApiKey service');
      return this.apiKeyConverter.convert(apiKey);
    } catch (error) {
      this.logger.error(`Error in fetchApiKey:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch api key',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateKeyAndSecret(key: string, secret: string) {
    this.logger.info('START: validateKeyAndSecret service');
    try {
      this.logger.info(`START: validateKeyAndSecret service`);

      const apiKey = await this.apiKeyRepository.findOne({
        relations: {
          organization: true,
        },
        where: {
          key,
        },
      });

      if (!apiKey) return null;

      this.logger.info(`END: validateKeyAndSecret service`);

      const isValid = await bcrypt.compare(secret, apiKey.secret);
      return isValid ? apiKey : null;
    } catch (error) {
      this.logger.error(
        `Error in validateKeyAndSecret:`,
        error,
      );

      throw error;
    }
  }
}
