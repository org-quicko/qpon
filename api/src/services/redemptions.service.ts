
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redemption } from '../entities/redemption.entity';

@Injectable()
export class RedemptionsService {
  
constructor(
    @InjectRepository(Redemption) 
    private readonly redemptionsRepository: Repository<Redemption>
) {}


  /**
   * Redeem coupon code
   */
  async redeemCouponCode(@Body() body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch redemptions
   */
  async fetchRedemptions(couponId?: string, campaignId?: string, couponCodeId?: string, from?: number, to?: number, skip?: number, take?: number) {
    throw new Error('Method not implemented.');
  }
}
