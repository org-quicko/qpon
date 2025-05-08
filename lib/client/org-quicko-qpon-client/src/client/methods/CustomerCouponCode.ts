import { ClientException, LoggerFactory } from '@org.quicko/core';
import winston from 'winston';
import { CustomerCouponCode as CustomerCouponCodeBean } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class CustomerCouponCode extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async addCustomersToCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    data: Pick<CustomerCouponCodeBean, 'customers'>
  ) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.addCustomersToCouponCode.name}`
      );
      this.logger.debug(`Request`, {
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        data,
      });

      const response = await super.post(APIURL.ADD_CUSTOMERS_TO_COUPON_CODE, instanceToPlain(data), {
        params: [couponId, campaignId, couponCodeId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(
        `End Client : ${this.constructor.name},${this.addCustomersToCouponCode.name}`
      );

      return response;
    } catch (error) {
      throw new ClientException('Failed to add customers to coupon code', error);
    }
  }

  async getCustomersForCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    skip: number = 0,
    take: number = 10
  ) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.getCustomersForCouponCode.name}`
      );
      this.logger.debug(`Request`, {
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        skip,
        take,
      });

      const queryParams: { skip: number; take: number } = { skip, take };

      const response = await super.get({
        url: APIURL.FETCH_CUSTOMERS_FOR_COUPON_CODE,
        params: [couponId, campaignId, couponCodeId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(
        `End Client : ${this.constructor.name},${this.getCustomersForCouponCode.name}`
      );

      return response;
    } catch (error) {
      throw new ClientException('Failed to get customers for coupon code', error);
    }
  }

  async updateCustomerCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    data: Pick<CustomerCouponCodeBean, 'customers'>
  ) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.updateCustomerCouponCode.name}`
      );
      this.logger.debug(`Request`, {
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        data,
      });

      const response = await super.patch(APIURL.UPDATE_CUSTOMER_COUPON_CODE, data, {
        params: [couponId, campaignId, couponCodeId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(
        `End Client : ${this.constructor.name},${this.updateCustomerCouponCode.name}`
      );

      return response;
    } catch (error) {
      throw new ClientException('Failed to update customers associated with coupon code', error);
    }
  }

  async deleteCustomerCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    customerId: string
  ) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.deleteCustomerCouponCode.name}`
      );
      this.logger.debug(`Request`, {
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        customer_id: customerId,
      });

      const response = await super.delete(APIURL.DELETE_CUSTOMER_COUPON_CODE, {
        params: [couponId, campaignId, couponCodeId, customerId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(
        `End Client : ${this.constructor.name},${this.deleteCustomerCouponCode.name}`
      );

      return response;
    } catch (error) {
      throw new ClientException('Failed to delete customer from coupon code', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger('logger')!;
    }

    return this.logger;
  }
}
