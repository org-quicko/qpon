import { ClientException, LoggerFactory } from '@org-quicko/core';
import winston from 'winston';
import { Coupon as CouponBean, PaginatedList } from '@org-quicko/qpon-core';
import { CouponSummaryWorkbook } from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Coupon extends RestClient {
  private readonly logger: winston.Logger = LoggerFactory.getLogger(Coupon.name);

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
  }

  async getCoupon(organizationId: string, couponId: string) : Promise<CouponBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId });

      const response = await super.get({
        url: APIURL.FETCH_COUPON,
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get coupon', error, error.code);
    }
  }

  async getAllCoupons(organizationId: string, skip: number = 0, take: number = 10) : Promise<PaginatedList<CouponBean>> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllCoupons.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, skip, take });

      const queryParams = { skip, take };

      const response = await super.get({
        url: APIURL.FETCH_COUPONS,
        params: [organizationId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllCoupons.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get coupons', error, error.code);
    }
  }

  async createCoupon(
    organizationId: string,
    data: Pick<
      CouponBean,
      'name' | 'itemConstraint' | 'discountType' | 'discountUpto' | 'discountValue'
    >
  ) : Promise<CouponBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, data });

      const response = await super.post(APIURL.CREATE_COUPON, instanceToPlain(Object.assign(new CouponBean(), data)), { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to create coupon', error, error.code);
    }
  }

  async updateCoupon(
    organizationId: string,
    couponId: string,
    data: Pick<CouponBean, 'name' | 'itemConstraint' | 'discountUpto'>
  ) : Promise<CouponBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId, data });

      const response = await super.patch(APIURL.UPDATE_COUPON, instanceToPlain(Object.assign(new CouponBean(), data)), {
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to update coupon', error, error.code);
    }
  }

  async deactivateCoupon(organizationId: string, couponId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deactivateCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId });

      const response = await super.post(
        APIURL.DEACTIVATE_COUPON,
        {},
        { params: [organizationId, couponId] }
      );

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deactivateCoupon.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to deactivate coupon', error, error.code);
    }
  }

  async reactivateCoupon(organizationId: string, couponId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.reactivateCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId });

      const response = await super.post(
        APIURL.REACTIVATE_COUPON,
        {},
        { params: [organizationId, couponId] }
      );

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.reactivateCoupon.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to reactivate coupon', error, error.code);
    }
  }

  async deleteCoupon(organizationId: string, couponId: string) : Promise<CouponBean> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteCoupon.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId });

      const response = await super.delete(APIURL.DELETE_COUPON, {
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteCoupon.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to delete coupon', error, error.code);
    }
  }

  async getCouponSummary(organizationId: string) : Promise<CouponSummaryWorkbook> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCouponSummary.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.get({ url: APIURL.FETCH_COUPON_SUMMARY, params: [organizationId], headers: { 'x-accept-type': 'application/json;format=sheet-json' }, });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCouponSummary.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get coupon summary', error, error.code);
    }
  }

  async getCouponSummaries(
    organizationId: string,
    couponId: string,
    skip: number = 0,
    take: number = 10
  ) : Promise<CouponSummaryWorkbook> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCouponSummaries.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId });

      const response = await super.get({
        url: APIURL.FETCH_COUPON_SUMMARIES,
        params: [organizationId, couponId],
        queryParams: { skip: skip, take: take },
        headers: { 'x-accept-type': 'application/json;format=sheet-json' },
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCouponSummaries.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get coupon summaries', error, error.code);
    }
  }
}
