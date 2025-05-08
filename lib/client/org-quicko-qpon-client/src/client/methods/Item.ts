import { ClientException, LoggerFactory } from '@org.quicko/core';
import winston from 'winston';
import { Item as ItemBean } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Item extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async createItem(organizationId: string, data: Pick<ItemBean, 'name' | 'description' | 'externalId' | 'customFields'>) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createItem.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, data });

      const response = await super.post(APIURL.CREATE_ITEM, instanceToPlain(data), { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createItem.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to create item', error);
    }
  }

  async getItem(organizationId: string, itemId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getItem.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, item_id: itemId });

      const response = await super.get({ url: APIURL.FETCH_ITEM, params: [organizationId, itemId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getItem.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get item', error);
    }
  }

  async getAllItems(
    organizationId: string,
    name?: string,
    externalId?: string,
    skip: number = 0,
    take: number = 10,
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllItems.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        skip,
        take,
        name,
        external_id: externalId,
      });

      const queryParams: { skip: number; take: number; name?: string; external_id?: string } = {
        skip,
        take,
      };
      if (name) queryParams.name = name;
      if (externalId) queryParams.external_id = externalId;

      const response = await super.get({
        url: APIURL.FETCH_ITEMS,
        params: [organizationId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllItems.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get items', error);
    }
  }

  async updateItem(
    organizationId: string,
    itemId: string,
    data: Pick<ItemBean, 'name' | 'description' | 'externalId' | 'customFields'>,
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateItem.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, item_id: itemId, data });

      const response = await super.patch(APIURL.UPDATE_ITEM, data, {
        params: [organizationId, itemId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateItem.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to update item', error);
    }
  }

  async deleteItem(organizationId: string, itemId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteItem.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, item_id: itemId });

      const response = await super.delete(APIURL.DELETE_ITEM, { params: [organizationId, itemId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteItem.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to delete item', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger('logger')!;
    }

    return this.logger;
  }
}
