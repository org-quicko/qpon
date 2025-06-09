import { ClientException, LoggerFactory, LoggingLevel } from '@org-quicko/core';
import winston from 'winston';
import { Organization as OrganizationBean, PaginatedList } from '@org-quicko/qpon-core';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Organization extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = LoggerFactory.createLogger('logger', LoggingLevel.info);
  }

  async getOrganization(organizationId: string) : Promise<OrganizationBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getOrganization.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.get({ url: APIURL.FETCH_ORGANIZATION, params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getOrganization.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get organization', error);
    }
  }

  async getAllOrganizations(skip: number = 0, take: number = 10) : Promise<PaginatedList<OrganizationBean>> {
    this.logger.info(`Start Client : ${this.constructor.name},${this.getAllOrganizations.name}`);
    this.logger.debug(`Request`, { skip, take });
    try {

      const response = await super.get({
        url: APIURL.FETCH_ORGANIZATIONS,
        params: [],
        queryParams: { skip: skip, take: take },
      });
      
      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllOrganizations.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get organization', error);
    }
  }

  async deleteOrganization(organizationId: string) : Promise<OrganizationBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteOrganization.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.delete(APIURL.DELETE_ORGANIZATION, { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteOrganization.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to delete organization', error);
    }
  }

  async updateOrganization(organizationId: string, data: Pick<OrganizationBean, 'name' | 'currency' | 'externalId'>) : Promise<OrganizationBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateOrganization.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.patch(APIURL.UPDATE_ORGANIZATION, data, { params: [organizationId] });
      
      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateOrganization.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to update organization', error);
    }
  }
}
