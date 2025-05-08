import { ClientException, LoggerFactory } from '@org.quicko/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import winston from 'winston';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class ApiKey extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async getApiKey(organizationId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getApiKey.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.get({ url: APIURL.FETCH_API_KEY, params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getApiKey.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get API key', error);
    }
  }

  async createApiKey(organizationId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createApiKey.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.post(APIURL.CREATE_API_KEY, {}, { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createApiKey.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to create API key', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger("logger")!;
    }

    return this.logger;
  }
}