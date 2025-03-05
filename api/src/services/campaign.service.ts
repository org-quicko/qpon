
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CampaignDto } from '../dtos';


@Injectable()
export class CampaignService {
  
constructor(
    @InjectRepository(Campaign) 
    private readonly campaignRepository: Repository<Campaign>
) {}


  /**
   * Create campaign
   */
  async createCampaign(couponId: string, body: CampaignDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch campaigns
   */
  async fetchCampaigns(couponId: string, status?: string, budgeted?: boolean, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch campaign
   */
  async fetchCampaign(couponId: string, campaignId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update campaign
   */
  async updateCampaign(couponId: string, campaignId: string, body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(couponId: string, campaignId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Deactivate campaign
   */
  async deactivateCampaign(couponId: string, campaignId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Reactivate campaign
   */
  async reactivateCampaign(couponId: string, campaignId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch campaign summary
   */
  async fetchCampaignSummary(campaignId?: string, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }
}
