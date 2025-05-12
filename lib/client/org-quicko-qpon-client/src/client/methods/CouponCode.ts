import { ClientException, LoggerFactory } from '@org.quicko/core';
import winston from 'winston';
import { CouponCode as CouponCodeBean, PaginatedList } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class CouponCode extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async createCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    data: Pick<
      CouponCodeBean,
      | 'code'
      | 'description'
      | 'customerConstraint'
      | 'maxRedemptions'
      | 'minimumAmount'
      | 'maxRedemptionPerCustomer'
      | 'visibility'
      | 'durationType'
      | 'expiresAt'
    >
  ) : Promise<CouponCodeBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        data,
      });

      const response = await super.post(APIURL.CREATE_COUPON_CODE, instanceToPlain(data), {
        params: [organizationId, couponId, campaignId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createCouponCode.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to create coupon code', error);
    }
  }

  async getCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string
  ) : Promise<CouponCodeBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
      });

      const response = await super.get({
        url: APIURL.FETCH_COUPON_CODE,
        params: [organizationId, couponId, campaignId, couponCodeId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCouponCode.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get coupon code', error);
    }
  }

  async getAllCouponCodes(
    organizationId: string,
    couponId: string,
    campaignId: string,
    status?: string,
    visibility?: string,
    externalCustomerId?: string,
    durationType?: string,
    skip: number = 0,
    take: number = 10
  ) : Promise<PaginatedList<CouponCodeBean>> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllCouponCodes.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        status,
        visibility,
        external_customer_id: externalCustomerId,
        duration_type: durationType,
        skip,
        take,
      });

      const queryParams: {
        status?: string;
        visibility?: string;
        external_customer_id?: string;
        duration_type?: string;
        skip: number;
        take: number;
      } = { skip, take };
      if (status) queryParams.status = status;
      if (visibility) queryParams.visibility = visibility;
      if (externalCustomerId) queryParams.external_customer_id = externalCustomerId;
      if (durationType) queryParams.duration_type = durationType;

      const response = await super.get({
        url: APIURL.FETCH_COUPON_CODES,
        params: [organizationId, couponId, campaignId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllCouponCodes.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get coupon codes', error);
    }
  }

  async updateCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    data: Pick<
      CouponCodeBean,
      | 'visibility'
      | 'description'
      | 'customerConstraint'
      | 'durationType'
      | 'expiresAt'
      | 'maxRedemptionPerCustomer'
      | 'maxRedemptions'
      | 'minimumAmount'
    >
  ) : Promise<CouponCodeBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        data,
      });

      const response = await super.patch(APIURL.UPDATE_COUPON_CODE, instanceToPlain(data), {
        params: [organizationId, couponId, campaignId, couponCodeId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateCouponCode.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to update coupon code', error);
    }
  }

  async getCouponCodesByCoupon(
    organizationId: string,
    couponId: string,
    campaignId?: string,
    skip: number = 0,
    take: number = 10
  ) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.getCouponCodesByCoupon.name}`
      );
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        skip,
        take,
      });

      const queryParams: { campaign_id?: string; skip: number; take: number } = { skip, take };
      if (campaignId) queryParams.campaign_id = campaignId;

      const response = await super.get({
        url: APIURL.FETCH_COUPON_CODES_BY_COUPON,
        params: [organizationId, couponId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCouponCodesByCoupon.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get coupon codes by coupon', error);
    }
  }

  async deleteCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string
  ) : Promise<CouponCodeBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
      });

      const response = await super.delete(APIURL.DELETE_COUPON_CODE, {
        params: [organizationId, couponId, campaignId, couponCodeId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteCouponCode.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to delete coupon code', error);
    }
  }

  async deactivateCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deactivateCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
      });

      const response = await super.post(
        APIURL.DEACTIVATE_COUPON_CODE,
        {},
        { params: [organizationId, couponId, campaignId, couponCodeId] }
      );

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deactivateCouponCode.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to deactivate coupon code', error);
    }
  }

  async reactivateCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.reactivateCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
      });

      const response = await super.post(
        APIURL.REACTIVATE_COUPON_CODE,
        {},
        { params: [organizationId, couponId, campaignId, couponCodeId] }
      );

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.reactivateCouponCode.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to reactivate coupon code', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger('logger')!;
    }

    return this.logger;
  }
}
