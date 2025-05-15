import {
  ClientException,
  LoggerFactory,
} from '@org.quicko/core';
import winston from 'winston';
import { Customer as CustomerBean, PaginatedList } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Customer extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async getCustomer(organizationId: string, customerId: string) : Promise<CustomerBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCustomer.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, customer_id: customerId });

      const response = await super.get({ url: APIURL.FETCH_CUSTOMER, params: [organizationId, customerId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCustomer.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get customer', error);
    }
  }

  async getAllCustomers(organizationId: string, skip: number = 0, take: number = 10) : Promise<PaginatedList<CustomerBean>> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllCustomers.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, skip, take });

      const response = await super.get({
        url: APIURL.FETCH_CUSTOMERS,
        params: [organizationId],
        queryParams: { skip: skip, take: take },
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllCustomers.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get customers', error);
    }
  }

  async createCustomer(organizationId: string, data: Pick<CustomerBean, 'name' | 'email' | 'phone' | 'externalId'>) : Promise<CustomerBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createCustomer.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, data });

      const response = await super.post(APIURL.CREATE_CUSTOMER, instanceToPlain(data), { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createCustomer.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to create customer', error);
    }
  }

  async deleteCustomer(organizationId: string, customerId: string) : Promise<CustomerBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteCustomer.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, customer_id: customerId });

      const response = await super.delete(APIURL.DELETE_CUSTOMER, { params: [organizationId, customerId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteCustomer.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to delete customer', error);
    }
  }

  async updateCustomer(organizationId: string, customerId: string, data: Pick<CustomerBean, 'name' | 'email' | 'phone' | 'externalId'>) : Promise<CustomerBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateCustomer.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, customer_id: customerId, data });

      const response = await super.patch(APIURL.UPDATE_CUSTOMER, data, { params: [organizationId, customerId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateCustomer.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to update customer', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger("logger")!;
    }

    return this.logger;
  }
}
