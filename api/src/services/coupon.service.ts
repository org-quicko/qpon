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
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from '../dtos';
import { LoggerService } from './logger.service';
import {
  campaignStatusEnum,
  couponCodeStatusEnum,
  itemConstraintEnum,
  sortOrderEnum,
  statusEnum,
} from '../enums';
import { CouponConverter } from '../converters/coupon.converter';
import { Campaign } from '../entities/campaign.entity';
import { CouponCode } from '../entities/coupon-code.entity';
import { CouponSummarySheetConverter } from '../converters/coupon-summary-sheet.converter';
import { CouponSummaryMv } from '../entities/coupon-summary.view';
import { CouponListConverter } from 'src/converters/coupon-list.converter';
import { CouponItem } from 'src/entities/coupon-item.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponSummaryMv)
    private readonly couponSummaryMvRepository: Repository<CouponSummaryMv>,
    private couponConverter: CouponConverter,
    private couponSummarySheetConverter: CouponSummarySheetConverter,
    private couponListConverter: CouponListConverter,
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
            name: ILike(body.name),
            status: Not(statusEnum.ARCHIVE),
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
    sortBy?: string,
    sortOrder?: sortOrderEnum,
  ) {
    this.logger.info('START: fetchCoupons service');
    try {
      let nameFilter: string = '';

      if (whereOptions.name) {
        nameFilter = whereOptions.name as string;
        delete whereOptions.name;
      }

      if (!whereOptions.status) {
        whereOptions.status = Not(statusEnum.ARCHIVE);
      }

      const [coupons, count] = await this.couponRepository.findAndCount({
        where: {
          organization: {
            organizationId,
          },
          ...(nameFilter && { name: ILike(`%${nameFilter}%`) }),
          ...whereOptions,
        },
        ...(sortBy && { order: { [sortBy]: sortOrder } }),
        skip,
        take,
      });

      if (!coupons || coupons.length == 0) {
        this.logger.warn('Coupons not found');
      }

      this.logger.info('END: fetchCoupons service');
      return this.couponListConverter.convert(coupons, skip, take, count);
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
          status: Not(statusEnum.ARCHIVE),
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
          where: { couponId, status: Not(statusEnum.ARCHIVE) },
        });

        if (!existingCoupon) {
          this.logger.warn('Coupon not found', couponId);
          throw new NotFoundException(`Coupon not found`);
        }

        if (body.name) {
          const coupon = await manager
            .getRepository(Coupon)
            .createQueryBuilder('coupon')
            .where(
              `LOWER(coupon.name) = LOWER(:name) AND status != 'archive'`,
              {
                name: body.name,
              },
            )
            .getOne();

          if (coupon) {
            this.logger.warn('Coupon with same name exists');
            throw new ConflictException('Coupon with same name exists');
          }
        }

        if (
          existingCoupon.itemConstraint == itemConstraintEnum.SPECIFIC &&
          body.itemConstraint == itemConstraintEnum.ALL
        ) {
          await manager.delete(CouponItem, {
            coupon: { couponId: existingCoupon.couponId },
          });
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

        const updatedCoupon = await manager.save(Coupon, existingCoupon);

        this.logger.info('END: updateCoupon service');
        return this.couponConverter.convert(updatedCoupon);
      } catch (error) {
        this.logger.error(`Error in updateCoupon: ${error.message}`, error);

        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException ||
          error instanceof ConflictException
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
    return this.datasource.transaction(async (manager) => {
      try {
        const coupon = await manager.findOne(Coupon, {
          relations: {
            couponItems: true,
            couponCodes: true,
            campaigns: true,
          },
          where: {
            couponId,
            status: Not(statusEnum.ARCHIVE),
          },
        });

        if (!coupon) {
          this.logger.warn('Coupon not found', couponId);
          throw new NotFoundException('Coupon not found');
        }

        //mark all campaigns archive
        await manager.update(
          Campaign,
          { coupon: { couponId } },
          { status: campaignStatusEnum.ARCHIVE },
        );

        //mark all coupon codes archive
        await manager.update(
          CouponCode,
          { coupon: { couponId } },
          { status: couponCodeStatusEnum.ARCHIVE },
        );

        // delete the rows in couponitem table
        await manager.delete(CouponItem, { coupon: { couponId } });

        // mark coupon as archive
        await manager.update(
          Coupon,
          { couponId },
          { status: statusEnum.ARCHIVE },
        );

        this.logger.info('END: deleteCoupon service');
      } catch (error) {
        this.logger.error(`Error in deleteCoupon: ${error.message}`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to delete coupon',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
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
            status: Not(statusEnum.ARCHIVE),
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
          status: Not(statusEnum.ARCHIVE),
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
   * Fetch coupon summary
   */
  async fetchCouponSummary(organizationId: string, couponId: string) {
    this.logger.info('START: fetchCouponSummary service');
    try {
      const couponSummaries = await this.couponSummaryMvRepository.find({
        where: {
          organizationId,
          couponId,
          status: Not(statusEnum.ARCHIVE),
        },
      });

      if (!couponSummaries || couponSummaries.length == 0) {
        this.logger.warn('Unable to find summary for coupon');
        throw new NotFoundException('Coupon summary not found');
      }

      this.logger.info('END: fetchCouponSummary service');
      return this.couponSummarySheetConverter.convert(
        couponSummaries,
        organizationId,
      );
    } catch (error) {
      this.logger.error(`Error in fetchCouponSummary: ${error.message}`, error);

      throw new HttpException(
        'Failed to fetch coupon summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupons summary
   */
  async fetchCouponsSummary(
    organizationId: string,
    whereOptions: FindOptionsWhere<CouponSummaryMv> = {},
    skip: number = 0,
    take: number = 10,
  ) {
    this.logger.info('START: fetchCouponsSummary service');
    try {
      const couponSummaries = await this.couponSummaryMvRepository.find({
        where: {
          organizationId,
          ...whereOptions,
          status: Not(statusEnum.ARCHIVE),
        },
        skip,
        take,
      });

      if (!couponSummaries || couponSummaries.length == 0) {
        this.logger.warn('Unable to find summary for coupons');
      }

      this.logger.info('END: fetchCouponsSummary service');
      return this.couponSummarySheetConverter.convert(
        couponSummaries,
        organizationId,
      );
    } catch (error) {
      this.logger.error(
        `Error in fetchCouponsSummary: ${error.message}`,
        error,
      );

      throw new HttpException(
        'Failed to fetch summary of coupons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch coupon
   */
  async fetchCouponForValidation(couponId: string) {
    this.logger.info('START: fetchCoupon service');
    try {
      const coupon = await this.couponRepository.findOne({
        where: {
          couponId,
        },
        relations: {
          couponItems: true,
          organization: true,
        },
      });

      if (!coupon) {
        this.logger.warn('Coupon not found');
        throw new NotFoundException('Coupon not found');
      }

      this.logger.info('END: fetchCoupon service');
      return coupon;
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
}
