import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, ILike, Not, Repository } from 'typeorm';
import { CouponCode } from '../entities/coupon-code.entity';
import { CreateCouponCodeDto, UpdateCouponCodeDto } from '../dtos';
import { LoggerService } from './logger.service';
import {
  couponCodeStatusEnum,
  customerConstraintEnum,
  durationTypeEnum,
  sortOrderEnum,
} from '../enums';
import { CouponCodeConverter } from '../converters/coupon-code.converter';
import { CouponCodeWorkbookConverter } from '../converters/coupon-code';
import { Campaign } from 'src/entities/campaign.entity';
import { CouponCodeListConverter } from 'src/converters/coupon-code-list.converter';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';

@Injectable()
export class CouponCodeService {
  constructor(
    @InjectRepository(CouponCode)
    private readonly couponCodeRepository: Repository<CouponCode>,
    private couponCodeConverter: CouponCodeConverter,
    private couponCodeWorkbookConverter: CouponCodeWorkbookConverter,
    private couponCodeListConverter: CouponCodeListConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  /**
   * Create coupon code
   */
  async createCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    body: CreateCouponCodeDto,
  ) {
    this.logger.info('START: createCouponCode service');
    return this.datasource.transaction(async (manager) => {
      try {
        const validCampaign = await manager.findOne(Campaign, {
          where: {
            campaignId,
            coupon: { couponId },
          },
        });

        if (!validCampaign) {
          this.logger.warn('Coupon is not linked to the given campaign', {
            couponId,
            campaignId,
          });
          throw new ConflictException(
            `Coupon ${couponId} is not associated with campaign ${campaignId}`,
          );
        }

        const existingCodes = await manager.find(CouponCode, {
          where: {
            code: body.code,
            status: couponCodeStatusEnum.ACTIVE,
            organization: {
              organizationId,
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

        const couponCodeEntity = manager.create(CouponCode, {
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
          organization: {
            organizationId,
          },
        });

        const savedCouponCode = await manager.save(
          CouponCode,
          couponCodeEntity,
        );

        this.logger.info('END: createCouponCode service');
        return this.couponCodeConverter.convert(savedCouponCode);
      } catch (error) {
        this.logger.error(`Error in createCouponCode:`, error);

        if (error instanceof ConflictException) {
          throw error;
        }

        throw new HttpException(
          'Failed to create coupon code',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }
  /**
   * Fetch coupon codes
   */
  async fetchCouponCodes(
    organizationId: string,
    couponId: string,
    campaignId: string,
    sortBy?: string,
    sortOrder?: sortOrderEnum,
    take: number = 10,
    skip: number = 0,
    whereOptions: FindOptionsWhere<CouponCode> = {},
  ) {
    this.logger.info('START: fetchCouponCodes service');
    try {
      let codeFilter: string = '';

      if (whereOptions.code) {
        codeFilter = whereOptions.code as string;
        delete whereOptions.code;
      }

      if (!whereOptions.status) {
        whereOptions.status = Not(couponCodeStatusEnum.ARCHIVE);
      }

      const [couponCodes, count] = await this.couponCodeRepository.findAndCount(
        {
          where: {
            organization: {
              organizationId,
            },
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
            ...(codeFilter && { code: ILike(`%${codeFilter}%`) }),
            ...whereOptions,
          },
          ...(sortBy && { order: { [sortBy]: sortOrder } }),
          skip,
          take,
        },
      );

      if (!couponCodes || couponCodes.length == 0) {
        this.logger.warn('Coupon codes not found', { campaignId, couponId });
      }

      this.logger.info('END: fetchCouponCodes service');
      return this.couponCodeListConverter.convert(
        couponCodes,
        skip,
        take,
        count,
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
    organizationId: string,
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
          organization: {
            organizationId,
          },
          status: Not(couponCodeStatusEnum.ARCHIVE),
        },
      });

      if (!couponCode) {
        this.logger.warn('Coupon code not found', { couponCodeId });
        throw new NotFoundException('Coupon code not found');
      }

      this.logger.info('END: fetchCouponCode service');
      return this.couponCodeConverter.convert(couponCode);
    } catch (error) {
      this.logger.error(`Error in fetchCouponCode:`, error);

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
   * Fetch coupon code for validation
   */
  async fetchCouponCodeForValidation(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: fetchCouponCodeForValidation service');
    try {
      const couponCode = await this.couponCodeRepository.findOne({
        relations: {
          organization: true,
        },
        where: {
          couponCodeId,
          campaign: {
            campaignId,
          },
          coupon: {
            couponId,
          },
          organization: {
            organizationId,
          },
          status: Not(couponCodeStatusEnum.ARCHIVE),
        },
      });

      if (!couponCode) {
        this.logger.warn('Coupon code not found', { couponCodeId });
        throw new NotFoundException('Coupon code not found');
      }

      this.logger.info('END: fetchCouponCodeForValidation service');
      return couponCode;
    } catch (error) {
      this.logger.error(
        `Error in fetchCouponCodeForValidation:`,
        error,
      );

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
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    body: UpdateCouponCodeDto,
  ) {
    this.logger.info('START: updateCouponCode service');
    return this.datasource.transaction(async (manager) => {
      try {
        const couponCode = await manager.findOne(CouponCode, {
          where: {
            couponCodeId,
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
            organization: {
              organizationId,
            },
            status: Not(couponCodeStatusEnum.ARCHIVE),
          },
        });

        if (!couponCode) {
          this.logger.warn('Coupon code not found', { couponCodeId });
          throw new NotFoundException('Coupon code not found');
        }

        if (
          couponCode.durationType == durationTypeEnum.LIMITED &&
          body.durationType == durationTypeEnum.FOREVER
        ) {
          body.expiresAt = undefined;
          await manager.update(CouponCode, { couponCodeId }, {
            expiresAt: null,
          } as any);
        }

        if (
          couponCode.customerConstraint == customerConstraintEnum.SPECIFIC &&
          body.customerConstraint == customerConstraintEnum.ALL
        ) {
          await manager.delete(CustomerCouponCode, {
            couponCode: { couponCodeId: couponCode.couponCodeId },
          });
        }

        await manager.update(CouponCode, { couponCodeId }, body);

        const updatedCouponCode = await manager.findOne(CouponCode, {
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
        this.logger.error(`Error in updateCouponCode:`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to update coupon code',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
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
        `Error in fetchCouponCodesByCode:`,
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
      return this.couponCodeWorkbookConverter.convert(couponCodes, organizationId);
    } catch (error) {
      this.logger.error(
        `Error in fetchCouponCodesByCodeSheet:`,
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
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: deactivateCouponCode service');
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
          organization: {
            organizationId,
          },
          status: Not(couponCodeStatusEnum.ARCHIVE),
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
    } catch (error) {
      this.logger.error(
        `Error in deactivateCouponCode:`,
        error,
      );
      throw new HttpException(
        'Failed to deactivate coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reactivate coupon code
   */
  async reactivateCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: reactivateCouponCode service');
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
          organization: {
            organizationId,
          },
          status: Not(couponCodeStatusEnum.ARCHIVE),
        },
      });

      if (!couponCode) {
        this.logger.warn('Coupon code not found', { couponCodeId });
        throw new NotFoundException('Coupon code not found');
      }

      const existingCouponCode = await this.couponCodeRepository.findOne({
        where: {
          code: couponCode.code,
          organization: {
            organizationId,
          },
          status: couponCodeStatusEnum.ACTIVE,
        },
      });

      if (existingCouponCode) {
        this.logger.warn('Coupon code already exists', { couponCodeId });
        throw new ConflictException('Coupon code already exists');
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
    } catch (error) {
      this.logger.error(
        `Error in reactivateCouponCode:`,
        error,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new HttpException(
        'Failed to reactivate coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete coupon code
   */
  async deleteCouponCode(
    organizationId: string,
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: deleteCouponCode service');

    const couponCode = await this.couponCodeRepository.findOne({
      where: {
        couponCodeId,
        campaign: {
          campaignId,
        },
        coupon: {
          couponId,
        },
        organization: {
          organizationId,
        },
      },
    });

    if (!couponCode) {
      this.logger.warn('Coupon code not found', { couponCodeId });
      throw new NotFoundException('Coupon code not found');
    }

    await this.couponCodeRepository.update(couponCodeId, {
      status: couponCodeStatusEnum.ARCHIVE,
    });

    this.logger.info('END: deleteCouponCode service');
  }
}
