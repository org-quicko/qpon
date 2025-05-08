/* eslint-disable import/no-extraneous-dependencies */
import * as winston from 'winston';
import { ClientException, LoggerFactory } from '@org.quicko/core';
import { Campaign as CampaignBean } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class Campaign extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger()!;
  }

  async createCampaign(organizationId: string, couponId: string, data: Pick<CampaignBean, 'name' | 'budget' | 'externalId'>) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createCampaign.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, coupon_id: couponId, data });

      const response = await super.post(APIURL.CREATE_CAMPAIGN, instanceToPlain(data), {
        params: [organizationId, couponId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createCampaign.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to create campaign', error);
    }
  }

  async getCampaign(organizationId: string, couponId: string, campaignId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCampaign.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
      });

      const response = await super.get({
        url: APIURL.FETCH_CAMPAIGN,
        params: [organizationId, couponId, campaignId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCampaign.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get campaign', error);
    }
  }

  async getAllCampaigns(
    organizationId: string,
    couponId: string,
    status?: string,
    budgeted?: boolean,
    skip: number = 0,
    take: number = 10
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllCampaigns.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        status,
        budgeted,
        skip,
        take,
      });

      const queryParams: { status?: string; budgeted?: boolean; skip: number; take: number } = {
        skip,
        take,
      };
      if (status) queryParams.status = status;
      if (budgeted !== undefined) queryParams.budgeted = budgeted;

      const response = await super.get({
        url: APIURL.FETCH_CAMPAIGNS,
        params: [organizationId, couponId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllCampaigns.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get campaigns', error);
    }
  }

  async updateCampaign(
    organizationId: string,
    couponId: string,
    campaignId: string,
    data: Pick<CampaignBean, 'name' | 'budget' | 'externalId'>
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateCampaign.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
        data,
      });

      const response = await super.patch(APIURL.UPDATE_CAMPAIGN, data, {
        params: [organizationId, couponId, campaignId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateCampaign.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to update campaign', error);
    }
  }

  async deleteCampaign(organizationId: string, couponId: string, campaignId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteCampaign.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
      });

      const response = await super.delete(APIURL.DELETE_CAMPAIGN, {
        params: [organizationId, couponId, campaignId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteCampaign.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to delete campaign', error);
    }
  }

  async deactivateCampaign(organizationId: string, couponId: string, campaignId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deactivateCampaign.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
      });

      const response = await super.post(
        APIURL.DEACTIVATE_CAMPAIGN,
        {},
        { params: [organizationId, couponId, campaignId] }
      );

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deactivateCampaign.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to deactivate campaign', error);
    }
  }

  async reactivateCampaign(organizationId: string, couponId: string, campaignId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.reactivateCampaign.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
      });

      const response = await super.post(
        APIURL.REACTIVATE_CAMPAIGN,
        {},
        { params: [organizationId, couponId, campaignId] }
      );

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.reactivateCampaign.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to reactivate campaign', error);
    }
  }

  async getCampaignSummary(organizationId: string, couponId: string, campaignId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCampaignSummary.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        campaign_id: campaignId,
      });

      const response = await super.get({
        url: APIURL.FETCH_CAMPAIGN_SUMMARY,
        params: [organizationId, couponId, campaignId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCampaignSummary.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get campaign summary', error);
    }
  }

  async getCampaignSummaries(
    organizationId: string,
    couponId: string,
    skip: number = 0,
    take: number = 10
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getCampaignSummaries.name}`);
      this.logger.debug(`Request`, {
        organization_id: organizationId,
        coupon_id: couponId,
        skip,
        take,
      });

      const queryParams: { skip: number; take: number } = { skip, take };

      const response = await super.get({
        url: APIURL.FETCH_CAMPAIGN_SUMMARIES,
        params: [organizationId, couponId],
        queryParams,
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getCampaignSummaries.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get campaign summaries', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger("logger")!;
    }

    return this.logger;
  }
}
