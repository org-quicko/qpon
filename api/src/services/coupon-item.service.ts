import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponItem } from '../entities/coupon-item.entity';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { Coupon } from '../entities/coupon.entity';
import { ItemsService } from './item.service';
import { CouponItemConverter } from '../converters/coupon-item.converter';
import { CreateCouponItemDto, UpdateCouponItemDto } from '../dtos';
import { Item } from 'src/entities/item.entity';

@Injectable()
export class CouponItemService {
  constructor(
    @InjectRepository(CouponItem)
    private readonly couponItemRepository: Repository<CouponItem>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private couponItemConverter: CouponItemConverter,
    private itemService: ItemsService,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  async addItems(couponId: string, body: CreateCouponItemDto) {
    this.logger.info('START: addItems service');
    try {
      return this.datasource.transaction(async (manager) => {
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

        const existingItems = await this.itemService.validateItemsExist(
          body.items,
          manager,
        );

        const couponItems = existingItems.map((item) => {
          return manager.create(CouponItem, { coupon, item });
        });

        const savedCouponItems = await manager.save(CouponItem, couponItems);

        this.logger.info('END: addItems service');
        return this.couponItemConverter.convert(savedCouponItems);
      });
    } catch (error) {
      this.logger.error(`Error in addItems: ${error.message}`, error);

      if (error.name == 'BadRequestException') {
        throw error;
      }

      throw new HttpException(
        'Failed to add items to coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchItems(
    couponId: string,
    skip: number = 0,
    take: number = 10,
    whereOptions: FindOptionsWhere<Item> = {},
  ) {
    this.logger.info('START: fetchItems service');
    try {
      let nameFilter: string = '';

      if (whereOptions.name) {
        nameFilter = whereOptions.name as string;
        delete whereOptions.name;
      }

      const coupon = await this.couponRepository.findOne({
        where: {
          couponId,
        },
      });

      if (!coupon) {
        this.logger.warn('Coupon not found');
        throw new NotFoundException('Coupon not found');
      }

      const [couponItems, count] = await this.couponItemRepository.findAndCount(
        {
          relations: {
            item: true,
          },
          where: {
            coupon: {
              couponId,
            },
            item: {
              ...(nameFilter && { name: ILike(`%${nameFilter}%`) }),
            },
          },
          select: {
            coupon: {
              couponId: true,
            },
            item: {
              itemId: true,
              name: true,
              description: true,
            },
          },
          skip,
          take,
        },
      );

      if (!couponItems || couponItems.length == 0) {
        this.logger.warn('No items found for this coupon', couponId);
      }

      this.logger.info('END: fetchItems service');
      return this.couponItemConverter.convert(couponItems, skip, take, count);
    } catch (error) {
      this.logger.error(`Error in fetchItems: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch items for coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchItemForValidation(couponId: string) {
    this.logger.info('START: fetchItemForValidation service');
    try {
      const couponItems = await this.couponItemRepository.findOne({
        relations: {
          coupon: {
            organization: true,
          },
        },
        where: {
          coupon: {
            couponId,
          },
        },
      });

      if (!couponItems) {
        this.logger.warn('No items found for this coupon', couponId);
      }

      this.logger.info('END: fetchItemForValidation service');
      return couponItems;
    } catch (error) {
      this.logger.error(
        `Error in fetchItemForValidation: ${error.message}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch items for coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateItems(couponId: string, body: UpdateCouponItemDto) {
    this.logger.info('START: updateItems service');
    return this.datasource.transaction(async (manager) => {
      try {
        const coupon = await manager.findOne(Coupon, { where: { couponId } });

        if (!coupon) {
          this.logger.warn('Coupon not found', couponId);
          throw new NotFoundException('Coupon not found');
        }

        const existingItems = await this.itemService.validateItemsExist(
          body.items!,
          manager,
        );

        await manager.delete(CouponItem, { coupon: { couponId } });

        const couponItems = existingItems.map((item) => {
          return manager.create(CouponItem, { coupon, item });
        });

        await manager.save(CouponItem, couponItems);

        this.logger.info('END: updateItems service');
        return this.couponItemConverter.convert(couponItems);
      } catch (error) {
        this.logger.error(`Error in updateItems: ${error.message}`, error);

        if (
          error instanceof NotFoundException ||
          error.name == 'BadRequestException'
        ) {
          throw error;
        }

        throw new HttpException(
          'Failed to update coupon items',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async removeItem(couponId: string, itemId: string) {
    this.logger.info('START: removeItem service');
    try {
      const couponItem = await this.couponItemRepository.find({
        relations: {
          item: true,
        },
        where: {
          coupon: {
            couponId,
          },
          item: {
            itemId,
          },
        },
      });

      if (!couponItem || couponItem.length == 0) {
        this.logger.warn('Item not found for coupon', {
          coupon_id: couponId,
          item_id: itemId,
        });
        throw new NotFoundException('Item not found for coupon');
      }

      await this.couponItemRepository.delete({
        coupon: { couponId },
        item: { itemId },
      });

      this.logger.info('END: removeItem service');
      return this.couponItemConverter.convert(couponItem);
    } catch (error) {
      this.logger.error(`Error in removeItem: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to remove item from coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
