// eslint-disable-next-line import/no-extraneous-dependencies
import { ClientException, LoggerFactory } from '@org.quicko/core';
import winston from 'winston';
import { Organization as OrganizationBean } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Organization extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger();
  }

  async getOrganization(organizationId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getOrganization.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.get({ url: APIURL.FETCH_ORGANIZATION, params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getOrganization.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get organization', error);
    }
  }

  async getAllOrganizations(skip: number = 0, take: number = 10) {
    this.logger.info(`Start Client : ${this.constructor.name},${this.getOrganization.name}`);
    this.logger.debug(`Request`, { skip, take });
    try {

      const response = await super.get({
        url: APIURL.FETCH_ORGANIZATIONS,
        params: [],
        queryParams: { skip: skip, take: take },
      });
      
      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getOrganization.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get organization', error);
    }
  }

  async createOrganization(data: OrganizationBean) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getOrganization.name}`);
      this.logger.debug(`Request`, { data });

      const response = await super.post(APIURL.CREATE_ORGANIZATION, instanceToPlain(data), { params: [] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createOrganization.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to create organization', error);
    }
  }

  async deleteOrganization(organizationId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteOrganization.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.delete(APIURL.DELETE_ORGANIZATION, { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteOrganization.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to delete organization', error);
    }
  }

  async updateOrganization(organizationId: string, data: Pick<OrganizationBean, 'name' | 'currency' | 'externalId'>) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateOrganization.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.patch(APIURL.UPDATE_ORGANIZATION, data, { params: [organizationId] });
      
      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateOrganization.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to update organization', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger('logger')!;
    }

    return this.logger;
  }
}
