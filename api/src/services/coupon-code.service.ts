
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponCode } from '../entities/coupon-code.entity';
import { CouponCodeDto } from '../dtos';


@Injectable()
export class CouponCodeService {
  
constructor(
    @InjectRepository(CouponCode) 
    private readonly couponCodeRepository: Repository<CouponCode>
) {}


  /**
   * Create coupon code
   */
  async createCouponCode(couponId: string, campaignId: string, @Body() body: CouponCodeDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch coupon codes
   */
  async fetchCouponCodes(couponId: string, campaignId: string, status?: string, visibility?: string, externalId?: string, durationType?: string, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch coupon code
   */
  async fetchCouponCode(couponId: string, campaignId: string, couponCodeId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update coupon code
   */
  async updateCouponCode(couponId: string, campaignId: string, couponCodeId: string, @Body() body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch coupon codes by code
   */
  async fetchCouponCodesByCode(code?: string, status?: string, customerId?: string, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * Deactivate coupon code
   */
  async deactivateCouponCode(couponId: string, campaignId: string, couponCodeId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Reactivate coupon code
   */
  async reactivateCouponCode(couponId: string, campaignId: string, couponCodeId: string) {
    throw new Error('Method not implemented.');
  }
}
