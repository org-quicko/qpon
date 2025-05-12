import { ClientException, LoggerFactory } from '@org.quicko/core';
import { DiscountType, SortOrder } from '@org.quicko.qpon/core';
import { OfferWorkbook } from '@org.quicko.qpon/sheet-core/offer_workbook/beans';
import winston from 'winston';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Offer extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async getOffer(
    organizationId: string,
    externalCustomerId?: string,
    code?: string,
    externalItemId?: string
  ) : Promise<OfferWorkbook> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getOffer.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        external_customer_id: externalCustomerId,
        code,
        external_item_id: externalItemId,
      });

      const queryParams: {
        external_customer_id?: string;
        code?: string;
        external_item_id?: string;
      } = {};
      if (externalCustomerId) queryParams.external_customer_id = externalCustomerId;
      if (code) queryParams.code = code;
      if (externalItemId) queryParams.external_item_id = externalItemId;

      const response = await super.get({
        url: APIURL.FETCH_OFFER,
        params: [organizationId],
        queryParams,
        headers: { 'x-accept-type': 'application/json;format=sheet-json' },
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getOffer.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get offer', error);
    }
  }

  async getAllOffers(
    organizationId: string,
    externalCustomerId?: string,
    externalItemId?: string,
    sortOrder?: SortOrder,
    discountType?: DiscountType,
    skip: number = 0,
    take: number = 10
  ) : Promise<OfferWorkbook> {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllOffers.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        external_customer_id: externalCustomerId,
        sort_order: sortOrder,
        discount_type: discountType,
        external_item_id: externalItemId,
        skip,
        take,
      });

      const queryParams: {
        external_customer_id?: string;
        code?: string;
        external_item_id?: string;
        sort_order?: SortOrder;
        discount_type?: DiscountType;
        skip: number;
        take: number;
      } = { skip, take };
      if (externalCustomerId) queryParams.external_customer_id = externalCustomerId;
      if (sortOrder) queryParams.sort_order = sortOrder;
      if (discountType) queryParams.discount_type = discountType;
      if (externalItemId) queryParams.external_item_id = externalItemId;

      const response = await super.get({
        url: APIURL.FETCH_OFFERS,
        params: [organizationId],
        queryParams,
        headers: { 'x-accept-type': 'application/json;format=sheet-json' },
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllOffers.name}`);

      return response.data;
    } catch (error) {
      throw new ClientException('Failed to get offers', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger("logger")!;
    }

    return this.logger;
  }
}
