import { ClientException, LoggerFactory, LoggingLevel } from '@org-quicko/core';
import winston from 'winston';
import { CouponItem as CouponItemBean, Item, PaginatedList } from '@org-quicko/qpon-core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class CouponItem extends RestClient {
  private readonly logger: winston.Logger = LoggerFactory.getLogger(CouponItem.name);

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
  }

  async addCouponItem(organizationId: string, couponId: string, itemIds: string[]) : Promise<CouponItemBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.addCouponItem.name}`);
      this.logger.info(`Request`, { organization_id: organizationId, coupon_id: couponId, items: itemIds });

      const response = await super.post(APIURL.ADD_COUPON_ITEMS, instanceToPlain(Object.assign(new CouponItemBean(), { items: itemIds })), {
        params: [organizationId, couponId],
      });

      this.logger.info(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.addCouponItem.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to add items to coupon', error, error.code);
    }
  }

  async getItemsForCoupon(organizationId: string, couponId: string, name?: string, skip: number = 0, take: number = 10) : Promise<PaginatedList<Item>> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getItemsForCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId });

      const queryParams: { skip?: number, take?: number, name?: string } = {};
      queryParams.skip = skip;
      queryParams.take = take;
      if(name) {
        queryParams.name = name;
      }

      const response = await super.get({
        url: APIURL.FETCH_ITEMS_FOR_COUPON,
        params: [organizationId, couponId],
        queryParams
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getItemsForCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get items for coupon', error, error.code);
    }
  }

  async removeItemFromCoupon(organizationId: string, couponId: string, itemId: string) : Promise<PaginatedList<Item>> {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.removeItemFromCoupon.name}`
      );
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        item_id: itemId,
      });

      const response = await super.delete(APIURL.REMOVE_ITEMS_FROM_COUPON, {
        params: [organizationId, couponId, itemId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.removeItemFromCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to remove items from coupon', error, error.code);
    }
  }

  async updateItemsInCoupon(organizationId: string, couponId: string, itemIds: string[]) : Promise<PaginatedList<Item>> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateItemsInCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId, items: itemIds });

      const response = await super.patch(APIURL.UPDATE_ITEMS_IN_COUPON, instanceToPlain(Object.assign(new CouponItemBean(), { items: itemIds })), {
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateItemsInCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to update items in coupon', error, error.code);
    }
  }
}
