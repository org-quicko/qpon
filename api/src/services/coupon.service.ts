
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CouponDto } from '../dtos';


@Injectable()
export class CouponService {
  
constructor(
    @InjectRepository(Coupon) 
    private readonly couponRepository: Repository<Coupon>
) {}


  /**
   * Create coupon
   */
  async createCoupon(organizationId: string, @Body() body: CouponDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch coupons
   */
  async fetchCoupons(organizationId: string, status?: string, discountType?: string, externalItemId?: string, name?: string, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch coupon
   */
  async fetchCoupon(organizationId: string, couponId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update coupon
   */
  async updateCoupon(organizationId: string, couponId: string, @Body() body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(organizationId: string, couponId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Deactivate coupon
   */
  async deactivateCoupon(organizationId: string, couponId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Reactivate coupon
   */
  async reactivateCoupon(organizationId: string, couponId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch coupons summary
   */
  async fetchCouponsSummary(organizationId: string, couponId?: string, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }
}
