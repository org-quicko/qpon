import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CouponCode } from '../entities/coupon-code.entity';
import { CreateCouponCodeDto, UpdateCouponCodeDto } from '../dtos';
import { LoggerService } from './logger.service';
import { couponCodeStatusEnum } from '../enums';
import { CouponCodeConverter } from '../converters/coupon-code.converter';
import { CouponCodeSheetConverter } from '../converters/coupon-code-sheet.converter';

@Injectable()
export class CouponCodeService {
  constructor(
    @InjectRepository(CouponCode)
    private readonly couponCodeRepository: Repository<CouponCode>,
    private couponCodeConverter: CouponCodeConverter,
    private couponCodeSheetConverter: CouponCodeSheetConverter,
    private logger: LoggerService,
  ) {}

  /**
   * Create coupon code
   */
  async createCouponCode(
    couponId: string,
    campaignId: string,
    body: CreateCouponCodeDto,
  ) {
    this.logger.info('START: createCouponCode service');
    try {
      const existingCodes = await this.couponCodeRepository.find({
        where: {
          code: body.code,
          status: couponCodeStatusEnum.ACTIVE,
          coupon: {
            couponId,
          },
          campaign: {
            campaignId,
          },
        },
      });

      if (existingCodes && existingCodes.length > 0) {
        this.logger.warn('Existing code with active status exists', {
          couponId,
          campaignId,
        });
        throw new ConflictException('Existing code with active status found');
      }

      const couponCodeEntity = this.couponCodeRepository.create({
        code: body.code,
        description: body.description,
        customerConstraint: body.customerConstraint,
        maxRedemptions: body.maxRedemptions,
        minimumAmount: body.minimumAmount,
        visibility: body.visibility,
        durationType: body.durationType,
        expiresAt: body.expiresAt,
        maxRedemptionPerCustomer: body.maxRedemptionPerCustomer,
        campaign: {
          campaignId,
        },
        coupon: {
          couponId,
        },
      });

      const savedCouponCode =
        await this.couponCodeRepository.save(couponCodeEntity);

      this.logger.info('END: createCouponCode service');
      return this.couponCodeConverter.convert(savedCouponCode);
    } catch (error) {
      this.logger.error(`Error in createCouponCode: ${error.message}`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * Fetch coupon codes
   */
  async fetchCouponCodes(
    couponId: string,
    campaignId: string,
    take: number = 10,
    skip: number = 0,
    whereOptions: FindOptionsWhere<CouponCode> = {},
  ) {
    this.logger.info('START: fetchCouponCodes service');
    try {
      const couponCodes = await this.couponCodeRepository.find({
        where: {
          campaign: {
            campaignId,
          },
          coupon: {
            couponId,
          },
          ...whereOptions,
        },
        skip,
        take,
      });

      if (!couponCodes || couponCodes.length == 0) {
        this.logger.warn('Coupon codes not found', { campaignId, couponId });
        throw new NotFoundException('Coupon codes not found');
      }

      this.logger.info('END: fetchCouponCodes service');
      return couponCodes.map((couponCode) =>
        this.couponCodeConverter.convert(couponCode),
      );
    } catch (error) {
      this.logger.error(`Error in fetchCouponCodes service`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch coupon codes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupon code
   */
  async fetchCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: fetchCouponCode service');
    try {
      const couponCode = await this.couponCodeRepository.findOne({
        where: {
          couponCodeId,
          campaign: {
            campaignId,
          },
          coupon: {
            couponId,
          },
        },
      });

      if (!couponCode) {
        this.logger.warn('Coupon code not found', { couponCodeId });
        throw new NotFoundException('Coupon code not found');
      }

      this.logger.info('END: fetchCouponCode service');
      return this.couponCodeConverter.convert(couponCode);
    } catch (error) {
      this.logger.error(`Error in fetchCouponCode: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update coupon code
   */
  async updateCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    body: UpdateCouponCodeDto,
  ) {
    this.logger.info('START: updateCouponCode service');
    try {
      const couponCode = await this.couponCodeRepository.findOne({
        where: {
          couponCodeId,
          campaign: {
            campaignId,
          },
          coupon: {
            couponId,
          },
        },
      });

      if (!couponCode) {
        this.logger.warn('Coupon code not found', { couponCodeId });
        throw new NotFoundException('Coupon code not found');
      }

      await this.couponCodeRepository.update({ couponCodeId }, body);

      const updatedCouponCode = await this.couponCodeRepository.findOne({
        where: {
          couponCodeId,
          campaign: {
            campaignId,
          },
          coupon: {
            couponId,
          },
        },
      });

      this.logger.info('END: updateCouponCode service');
      return this.couponCodeConverter.convert(updatedCouponCode!);
    } catch (error) {
      this.logger.error(`Error in updateCouponCode: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupon codes by code
   */
  async fetchCouponCodesByCode(
    organizationId: string,
    whereOptions: FindOptionsWhere<CouponCode> = {},
    take: number = 10,
    skip: number = 0,
  ) {
    this.logger.info('START: fetchCouponCodesByCode service');
    try {
      const couponCodes = await this.couponCodeRepository.find({
        where: {
          coupon: {
            organization: {
              organizationId,
            },
          },
          ...whereOptions,
        },
        skip,
        take,
      });

      if (!couponCodes || couponCodes.length == 0) {
        this.logger.warn('Coupon codes not found', { organizationId });
        throw new NotFoundException('Coupon codes not found');
      }

      this.logger.info('END: fetchCouponCodesByCode service');
      return couponCodes.map((couponCode) =>
        this.couponCodeConverter.convert(couponCode),
      );
    } catch (error) {
      this.logger.error(
        `Error in fetchCouponCodesByCode: ${error.message}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch coupon codes by code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupon codes by code - sheet-json
   */
  async fetchCouponCodesByCodeSheet(
    organizationId: string,
    whereOptions: FindOptionsWhere<CouponCode> = {},
    take: number = 10,
    skip: number = 0,
  ) {
    this.logger.info('START: fetchCouponCodesByCodeSheet service');
    try {
      const couponCodes = await this.couponCodeRepository.find({
        relations: {
          coupon: true,
          campaign: true,
        },
        where: {
          coupon: {
            organization: {
              organizationId,
            },
          },
          ...whereOptions,
        },
        select: {
          coupon: {
            couponId: true,
          },
          campaign: {
            campaignId: true,
          },
        },
        skip,
        take,
      });

      if (!couponCodes || couponCodes.length == 0) {
        this.logger.warn('Coupon codes not found', { organizationId });
        throw new NotFoundException('Coupon codes not found');
      }

      this.logger.info('END: fetchCouponCodesByCodeSheet service');
      return this.couponCodeSheetConverter.convert(couponCodes, organizationId);
    } catch (error) {
      this.logger.error(
        `Error in fetchCouponCodesByCodeSheet: ${error.message}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch coupon codes by code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deactivate coupon code
   */
  async deactivateCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: deactivateCouponCode service');

    const couponCode = await this.couponCodeRepository.findOne({
      where: {
        couponCodeId,
        campaign: {
          campaignId,
        },
        coupon: {
          couponId,
        },
      },
    });

    if (!couponCode) {
      this.logger.warn('Coupon code not found', { couponCodeId });
      throw new NotFoundException('Coupon code not found');
    }

    if (
      couponCode.status == couponCodeStatusEnum.EXPIRED ||
      couponCode.status == couponCodeStatusEnum.REDEEMED
    ) {
      this.logger.warn(
        `Cannot deactivate a coupon code of status ${couponCode.status}`,
        { couponCodeId },
      );
      throw new BadRequestException(
        `Cannot deactivate a coupon code of status ${couponCode.status}`,
      );
    }

    await this.couponCodeRepository.update(couponCodeId, {
      status: couponCodeStatusEnum.INACTIVE,
    });

    this.logger.info('END: deactivateCouponCode service');
  }

  /**
   * Reactivate coupon code
   */
  async reactivateCouponCode(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: reactivateCouponCode service');

    const couponCode = await this.couponCodeRepository.findOne({
      where: {
        couponCodeId,
        campaign: {
          campaignId,
        },
        coupon: {
          couponId,
        },
      },
    });

    if (!couponCode) {
      this.logger.warn('Coupon code not found', { couponCodeId });
      throw new NotFoundException('Coupon code not found');
    }

    if (couponCode.status == couponCodeStatusEnum.REDEEMED) {
      this.logger.warn(
        `Cannot reactivate a coupon code of status ${couponCode.status}`,
        { couponCodeId },
      );
      throw new BadRequestException(
        `Cannot reactivate a coupon code of status ${couponCode.status}`,
      );
    }

    await this.couponCodeRepository.update(couponCodeId, {
      status: couponCodeStatusEnum.ACTIVE,
    });

    this.logger.info('END: reactivateCouponCode service');
  }
}
