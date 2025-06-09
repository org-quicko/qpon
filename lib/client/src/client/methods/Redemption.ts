import { ClientException, LoggerFactory, LoggingLevel } from '@org-quicko/core';
import winston from 'winston';
import { CreateRedemption, SortOrder, TimePeriod } from '@org-quicko/qpon-core';
import { RedemptionWorkbook } from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Redemption extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = LoggerFactory.createLogger('logger', LoggingLevel.info);
  }

  async redeemCouponCode(organizationId: string, data: CreateRedemption) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.redeemCouponCode.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, data });

      const response = await super.post(APIURL.REDEEM_COUPON_CODE, instanceToPlain(data), { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.redeemCouponCode.name}`);

      return response;
    } catch (error: any) {
      this.logger.error(`Error`, error);
      throw new ClientException(error.message, error.cause, error.code);
    }
  }

  async getAllRedemptions(
    organizationId: string,
    couponId?: string,
    campaignId?: string,
    couponCodeId?: string,
    customerEmail?: string,
    from?: string,
    to?: string,
    skip: number = 0,
    take: number = 10
  ) : Promise<RedemptionWorkbook> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllRedemptions.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        customer_email: customerEmail,
        from,
        to,
        skip,
        take,
      });

      const queryParams: {
        coupon_id?: string;
        campaign_id?: string;
        coupon_code_id?: string;
        customer_email?: string;
        from?: string;
        to?: string;
        skip: number;
        take: number;
      } = { skip, take };
      if (couponId) queryParams.coupon_id = couponId;
      if (campaignId) queryParams.campaign_id = campaignId;
      if (couponCodeId) queryParams.coupon_code_id = couponCodeId;
      if (customerEmail) queryParams.customer_email = customerEmail;
      if (from) queryParams.from = from;
      if (to) queryParams.to = to;

      const response = await super.get({
        url: APIURL.FETCH_REDEMPTIONS,
        params: [organizationId],
        queryParams,
        headers: { 'x-accept-type': 'application/json;format=sheet-json' }
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllRedemptions.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get redemptions', error);
    }
  }

  async getRedemptionsForCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    customerEmail?: string,
    sortBy?: string,
    sortOrder?: SortOrder,
    skip: number = 0,
    take: number = 10,
  ) : Promise<RedemptionWorkbook> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getRedemptionsForCouponCode.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
        customer_email: customerEmail,
        skip,
        take,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const queryParams: {
        customer_email?: string;
        skip: number;
        take: number;
        sort_by?: string;
        sort_order?: string;
      } = { skip, take };
      if (customerEmail) queryParams.customer_email = customerEmail;
      if (sortBy && sortOrder) {
        queryParams.sort_by = sortBy;
        queryParams.sort_order = sortOrder;
      } 

      const response = await super.get({
        url: APIURL.FETCH_REDEMPTIONS_FOR_COUPON_CODE,
        params: [organizationId, couponId, campaignId, couponCodeId],
        queryParams,
        headers: { 'x-accept-type': 'application/json;format=sheet-json' }
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getRedemptionsForCouponCode.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get redemptions for coupon code', error);
    }
  }

  async generateRedemptionReport(
    organizationId: string,
    timePeriod?: TimePeriod,
    from?: string,
    to?: string,
    couponId?: string,
    campaignId?: string,
    couponCodeId?: string
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.generateRedemptionReport.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        time_period: timePeriod,
        from,
        to,
        coupon_id: couponId,
        campaign_id: campaignId,
        coupon_code_id: couponCodeId,
      });

      const queryParams: {
        time_period?: string;
        from?: string;
        to?: string;
        coupon_id?: string;
        campaign_id?: string;
        coupon_code_id?: string;
      } = {};
      if (timePeriod) queryParams.time_period = timePeriod;
      if (from) queryParams.from = from;
      if (to) queryParams.to = to;
      if (couponId) queryParams.coupon_id = couponId;
      if (campaignId) queryParams.campaign_id = campaignId;
      if (couponCodeId) queryParams.coupon_code_id = couponCodeId;

      const response = await super.get({
        url: APIURL.GENERATE_REDEMPTION_REPORT,
        params: [organizationId],
        queryParams,
        headers: { 'x-accept-type': 'application/json;format=sheet-json' }
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.generateRedemptionReport.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to generate redemption report', error);
    }
  }
}