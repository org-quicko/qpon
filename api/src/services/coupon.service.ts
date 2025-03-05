import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from '../dtos';
import { LoggerService } from './logger.service';
import { campaignStatusEnum, couponCodeStatusEnum, statusEnum } from '../enums';
import { CouponConverter } from '../converters/coupon.converter';
import { Campaign } from '../entities/campaign.entity';
import { CouponCode } from '../entities/coupon-code.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private couponConverter: CouponConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  /**
   * Create coupon
   */
  async createCoupon(organizationId: string, body: CreateCouponDto) {
    this.logger.info('START: createCoupon service');

    return this.datasource.transaction(async (manager) => {
      try {
        if (body.discountType && body.discountValue <= 0) {
          throw new BadRequestException('Invalid body');
        }

        const couponRepository = manager.getRepository(Coupon);

        const existingCoupon = await couponRepository.findOne({
          where: {
            name: Like(body.name),
          },
        });

        if (existingCoupon) {
          this.logger.warn('Coupon already exists');
          throw new ConflictException(
            `Coupon named ${body.name} already exists`,
          );
        }

        const couponEntity = couponRepository.create({
          name: body.name,
          itemConstraint: body.itemConstraint,
          discountType: body.discountType,
          discountValue: body.discountValue,
          discountUpto: body?.discountUpto,
          organization: {
            organizationId,
          },
        });

        const savedCoupon = await manager.save(couponEntity);

        this.logger.info('END: createCoupon service');
        return this.couponConverter.convert(savedCoupon);
      } catch (error) {
        this.logger.error(`Error in createCoupon: ${error.message}`, error);

        if (
          error instanceof ConflictException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }

        throw new HttpException(
          'Failed to create coupon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  /**
   * Fetch coupons
   */
  async fetchCoupons(
    organizationId: string,
    skip: number = 0,
    take: number = 10,
    whereOptions: FindOptionsWhere<Coupon> = {},
  ) {
    this.logger.info('START: fetchCoupons service');
    try {
      const coupons = await this.couponRepository.find({
        where: {
          organization: {
            organizationId,
          },
          ...whereOptions,
        },
        skip,
        take,
      });

      if (!coupons || coupons.length == 0) {
        this.logger.warn('Coupons not found');
        throw new NotFoundException('Coupons not found');
      }

      this.logger.info('END: fetchCoupons service');
      return coupons.map((coupon) => this.couponConverter.convert(coupon));
    } catch (error) {
      this.logger.error(`Error in fetchCoupons: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch coupons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupon
   */
  async fetchCoupon(couponId: string) {
    this.logger.info('START: fetchCoupon service');
    try {
      const coupon = await this.couponRepository.findOne({
        where: {
          couponId,
        },
        relations: {
          couponItems: true,
        },
      });

      if (!coupon) {
        this.logger.warn('Coupon not found');
        throw new NotFoundException('Coupon not found');
      }

      this.logger.info('END: fetchCoupon service');
      return this.couponConverter.convert(coupon);
    } catch (error) {
      this.logger.error(`Error in fetchCoupon: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update coupon
   */
  async updateCoupon(
    organizationId: string,
    couponId: string,
    body: UpdateCouponDto,
  ) {
    this.logger.info('START: updateCoupon service');

    return this.datasource.transaction(async (manager) => {
      try {
        const couponRepository = manager.getRepository(Coupon);

        // Find the coupon
        const existingCoupon = await couponRepository.findOne({
          where: { couponId },
          relations: {
            couponItems: true,
          },
        });

        if (!existingCoupon) {
          this.logger.warn('Coupon not found', couponId);
          throw new NotFoundException(`Coupon not found`);
        }

        // Update coupon fields
        if (body.name) {
          existingCoupon.name = body.name;
        }

        if (body.itemConstraint) {
          existingCoupon.itemConstraint = body.itemConstraint;
        }

        if (body.discountUpto) {
          existingCoupon.discountUpto = body.discountUpto;
        }

        const updatedCoupon = await manager.save(existingCoupon);

        this.logger.info('END: updateCoupon service');
        return this.couponConverter.convert(updatedCoupon);
      } catch (error) {
        this.logger.error(`Error in updateCoupon: ${error.message}`, error);

        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException
        ) {
          throw error;
        }

        throw new HttpException(
          'Failed to update coupon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId: string) {
    this.logger.info('START: deleteCoupon service');
    try {
      const coupon = await this.couponRepository.findOne({
        relations: {
          couponItems: true,
          couponCodes: true,
          campaigns: true,
        },
      });

      if (!coupon) {
        this.logger.warn('Coupon not found', couponId);
        throw new NotFoundException('Coupon not found');
      }

      //check for active campaigns
      coupon.campaigns.map((campaign) => {
        if (campaign.status == campaignStatusEnum.ACTIVE) {
          this.logger.warn('Coupon has active campaigns', couponId);
          throw new BadRequestException(
            "Coupon has active campaigns. Couldn't delete the coupon",
          );
        }
      });

      //check for active coupon codes
      coupon.couponCodes.map((couponCode) => {
        if (couponCode.status == couponCodeStatusEnum.ACTIVE) {
          this.logger.warn('Coupon has active coupon codes', couponId);
          throw new BadRequestException(
            "Coupon has active coupon codes. Coudln't delete the coupon",
          );
        }
      });

      await this.couponRepository.delete(couponId);

      this.logger.info('END: deleteCoupon service');
      return this.couponConverter.convert(coupon);
    } catch (error) {
      this.logger.error(`Error in deleteCoupon: ${error.message}`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deactivate coupon
   */
  async deactivateCoupon(couponId: string) {
    this.logger.info('START: deactivateCoupon service');
    return this.datasource.transaction(async (manager) => {
      try {
        const couponRepository = manager.getRepository(Coupon);

        const coupon = await couponRepository.findOne({
          where: {
            couponId,
          },
        });

        if (!coupon) {
          this.logger.warn('Coupon not found', couponId);
          throw new NotFoundException('Coupon not found');
        }

        await couponRepository.update(couponId, {
          status: statusEnum.INACTIVE,
        });

        await manager.update(
          Campaign,
          { coupon: { couponId } },
          { status: campaignStatusEnum.INACTIVE },
        );

        await manager.update(
          CouponCode,
          { coupon: { couponId } },
          { status: couponCodeStatusEnum.INACTIVE },
        );

        this.logger.info('END: deactivateCoupon service');
      } catch (error) {
        this.logger.error(`Error in deactivateCoupon: ${error.message}`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to deactivate coupon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  /**
   * Reactivate coupon
   */
  async reactivateCoupon(couponId: string) {
    this.logger.info('START: reactivateCoupon service');
    try {
      const coupon = await this.couponRepository.findOne({
        where: {
          couponId,
        },
      });

      if (!coupon) {
        this.logger.warn('Coupon not found', couponId);
        throw new NotFoundException('Coupon not found');
      }

      await this.couponRepository.update(couponId, {
        status: statusEnum.ACTIVE,
      });
      this.logger.info('END: reactivateCoupon service');
    } catch (error) {
      this.logger.error(`Error in reactivateCoupon: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to reactivate coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupons summary
   */
  async fetchCouponsSummary(
    organizationId: string,
    couponId?: string,
    take?: number,
    skip?: number,
  ) {
    throw new Error('Method not implemented.');
  }
}
