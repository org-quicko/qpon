import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from '../dtos';
import { LoggerService } from './logger.service';
import { CouponItem } from '../entities/coupon-item.entity';
import { Item } from '../entities/item.entity';
import {
  campaignStatusEnum,
  couponCodeStatusEnum,
  discountTypeEnum,
  itemConstraintEnum,
  statusEnum,
} from '../enums';
import { CouponConverter } from '../converters/coupon.converter';
import { QueryOptionsInterface } from 'src/interfaces/queryOptions.interface';

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
        if (
          (body.discountType === discountTypeEnum.FIXED &&
            body.discountValue <= 0) ||
          (body.discountType === discountTypeEnum.PERCENTAGE &&
            body.discountValue > 0) ||
          (body.itemConstraint == itemConstraintEnum.SPECIFIC &&
            body.items.length == 0)
        ) {
          throw new BadRequestException('Invalid body');
        }

        const couponRepository = manager.getRepository(Coupon);
        const couponItemRepository = manager.getRepository(CouponItem);
        const itemRepository = manager.getRepository(Item);

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

        const items = await itemRepository.find({
          where: {
            itemId: In(body.items),
          },
        });

        if (items.length !== body.items.length) {
          this.logger.warn('Some items were not found', body.items);
          throw new BadRequestException('Some items were not found');
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

        const couponItems = items.map((item) => {
          couponItemRepository.create({
            coupon: savedCoupon,
            item,
          });
        });

        await manager.save(couponItems);

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
    whereOptions: FindOptionsWhere<Coupon> = {},
    skip?: number,
    take: number = 10,
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

      if (!coupons) {
        this.logger.warn('Coupons not found');
        throw new NotFoundException('Coupons not found');
      }

      this.logger.info('END: fetchCoupons service');
      return coupons.map((coupon) => this.couponConverter.convert(coupon));
    } catch (error) {
      this.logger.error(`Error in fetchCoupons: ${error.message}`, error);

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
        const itemRepository = manager.getRepository(Item);
        const couponItemRepository = manager.getRepository(CouponItem);

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

        if (body.items) {
          // Extract current item IDs from the database
          const existingItemIds = existingCoupon.couponItems.map(
            (ci) => ci.item.itemId,
          );

          // Check if item IDs in request are different from existing ones
          const itemIdsChanged =
            body.items.length !== existingItemIds.length ||
            body.items.some((id) => !existingItemIds.includes(id));

          if (itemIdsChanged) {
            // Remove all existing CouponItems for this coupon
            await couponItemRepository.delete({
              coupon: { couponId: couponId },
            });

            // Fetch new items from the database
            const newItems = await itemRepository.find({
              where: {
                itemId: In(body.items),
              },
            });

            if (newItems.length !== body.items.length) {
              this.logger.warn('Some items were not found');
              throw new BadRequestException('Some items were not found');
            }

            // Create new CouponItem records
            const newCouponItems = newItems.map((item) =>
              couponItemRepository.create({
                coupon: existingCoupon,
                item: item,
              }),
            );

            // Save new CouponItems
            await manager.save(newCouponItems);
          }
        }

        // Save the updated coupon
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
        status: statusEnum.INACTIVE,
      });
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
