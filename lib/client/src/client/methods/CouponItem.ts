/* eslint-disable import/no-extraneous-dependencies */
import { ClientException, LoggerFactory } from '@org-quicko/core';
import winston from 'winston';
import { CouponItem as CouponItemBean } from '@org-quicko/qpon-core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class CouponItem extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async addCouponItems(organizationId: string, couponId: string, data: Pick<CouponItemBean, 'item'>) : Promise<CouponItemBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.addCouponItems.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId, data });

      const response = await super.post(APIURL.ADD_COUPON_ITEMS, instanceToPlain(data), {
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.addCouponItems.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to add items to coupon', error);
    }
  }

  async getItemsForCoupon(organizationId: string, couponId: string, name?: string, skip: number = 0, take: number = 10) {
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

      return response;
    } catch (error) {
      throw new ClientException('Failed to get items for coupon', error);
    }
  }

  async removeItemsFromCoupon(organizationId: string, couponId: string, itemId: string) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.removeItemsFromCoupon.name}`
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
      this.logger.info(`End Client : ${this.constructor.name},${this.removeItemsFromCoupon.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to remove items from coupon', error);
    }
  }

  async updateItemsInCoupon(organizationId: string, couponId: string, data: Pick<CouponItemBean, 'item'>) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateItemsInCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId, data });

      const response = await super.patch(APIURL.UPDATE_ITEMS_IN_COUPON, data, {
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateItemsInCoupon.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to update items in coupon', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger("logger")!;
    }

    return this.logger;
  }
}
