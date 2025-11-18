import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto, UpdateItemDto } from '../dtos';
import { LoggerService } from './logger.service';
import { ItemConverter } from '../converters/item.converter';
import { statusEnum } from '../enums';
import { CouponItem } from '../entities/coupon-item.entity';
import { ItemsListConverter } from 'src/converters/items-list.converter';
import { PassThrough } from 'stream';
import { format as csvFormat } from '@fast-csv/format';
import { ItemWiseDayWiseRedemptionSummaryMv } from 'src/entities/item-wise-day-wise-redemption-summary-mv';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(ItemWiseDayWiseRedemptionSummaryMv)
    private readonly itemWiseMvRepository: Repository<ItemWiseDayWiseRedemptionSummaryMv>,

    private itemConverter: ItemConverter,
    private itemListConverter: ItemsListConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  /**
   * Create item
   */
  async createItem(organizationId: string, body: CreateItemDto) {
    this.logger.info('START: createItem service');
    try {
      const existingItem = await this.itemsRepository.findOne({
        where: {
          name: ILike(body.name),
          status: statusEnum.ACTIVE,
        },
      });

      if (existingItem) {
        this.logger.warn('Item already exists', body.name);
        throw new ConflictException('Item already exists');
      }

      const itemEntity = this.itemsRepository.create({
        name: body.name,
        description: body.description,
        customFields: body.customFields,
        externalId: body.externalId,
        organization: {
          organizationId,
        },
      });

      const savedItem = await this.itemsRepository.save(itemEntity);

      this.logger.info('END: createItem service');
      return this.itemConverter.convert(savedItem);
    } catch (error) {
      this.logger.error(`Error in createItem:`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to add item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch items
   */
  async fetchItems(
    organizationId: string,
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

      const [items, count] = await this.itemsRepository.findAndCount({
        where: {
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
          ...(nameFilter && { name: ILike(`%${nameFilter}%`) }),
          ...whereOptions,
        },
        skip,
        take,
        order: {
          createdAt: 'DESC',
        },
      });

      if (!items || items.length == 0) {
        this.logger.warn('Items not found', organizationId);
      }

      this.logger.info('END: fetchItems service');
      return this.itemListConverter.convert(items, skip, take, count);
    } catch (error) {
      this.logger.error(`Error in fetchItems:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch item
   */
  async fetchItem(itemId: string) {
    this.logger.info('START: fetchItem service');
    try {
      const item = await this.itemsRepository.findOne({
        where: {
          itemId,
          status: statusEnum.ACTIVE,
        },
      });

      if (!item) {
        this.logger.warn('Item not found', itemId);
        throw new NotFoundException('Item not found');
      }

      this.logger.info('END: fetchItem service');
      return this.itemConverter.convert(item);
    } catch (error) {
      this.logger.error(`Error in fetchItem:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch item for validation
   */
  async fetchItemForValidation(itemId: string) {
    this.logger.info('START: fetchItemForValidation service');
    try {
      const item = await this.itemsRepository.findOne({
        relations: {
          organization: true,
        },
        where: {
          itemId,
          status: statusEnum.ACTIVE,
        },
      });

      if (!item) {
        this.logger.warn('Item not found', itemId);
        throw new NotFoundException('Item not found');
      }

      this.logger.info('END: fetchItemForValidation service');
      return item;
    } catch (error) {
      this.logger.error(
        `Error in fetchItemForValidation:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update item
   */
  async updateItem(itemId: string, body: UpdateItemDto) {
    this.logger.info('START: updateItem service');
    try {
      const item = await this.itemsRepository.findOne({
        where: {
          itemId,
          status: statusEnum.ACTIVE,
        },
      });

      if (!item) {
        this.logger.warn('Item not found', itemId);
        throw new NotFoundException('Item not found');
      }

      if (body.name) {
        const existingItem = await this.itemsRepository
          .createQueryBuilder('item')
          .where(`LOWER(item.name) = LOWER(:name) AND status = 'active' AND item_id != :itemId`, {
            name: body.name,
            itemId,
          })
          .getOne();

        if (existingItem) {
          this.logger.warn('Item with same name exists');
          throw new ConflictException('Item with same name exists');
        }
      }

      await this.itemsRepository.update({ itemId }, body);

      const savedItem = await this.itemsRepository.findOne({
        where: {
          itemId,
        },
      });

      this.logger.info('END: updateItem service');
      return this.itemConverter.convert(savedItem!);
    } catch (error) {
      this.logger.error(`Error in updateItem:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete item
   */
  async deleteItem(itemId: string) {
    this.logger.info('START: deleteItem service');
    return this.datasource.transaction(async (manager) => {
      try {
        const item = await manager.findOne(Item, {
          where: {
            itemId,
            status: statusEnum.ACTIVE,
          },
        });

        if (!item) {
          this.logger.warn('Item not found', itemId);
          throw new NotFoundException('Item not found');
        }

        const couponItems = await manager.find(CouponItem, {
          where: {
            item: {
              itemId,
            },
          },
        });

        if (couponItems) {
          await Promise.all(
            couponItems.map(async (couponItem) => {
              await manager.delete(CouponItem, {
                coupon: {
                  couponId: couponItem.couponId,
                },
                item: {
                  itemId: couponItem.itemId,
                },
              });
            }),
          );
        }

        await manager.update(Item, itemId, {
          status: statusEnum.INACTIVE,
        });

        this.logger.info('END: deleteItem service');
        return this.itemConverter.convert(item);
      } catch (error) {
        this.logger.error(`Error in deleteItem:`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to delete item',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async validateItemsExist(items: string[], manager: EntityManager) {
    this.logger.info('START: validateItemsExist service');
    try {
      const itemsRepository = manager.getRepository(Item);

      const existingItems = await itemsRepository.find({
        where: { itemId: In(items), status: statusEnum.ACTIVE },
      });

      const existingItemIds = existingItems.map((item) => item.itemId);

      const missingItemIds = items.filter(
        (id) => !existingItemIds.includes(id),
      );
      if (missingItemIds.length > 0) {
        this.logger.warn('Some items does not exist');
        throw new BadRequestException(
          `Items with IDs ${missingItemIds.join(', ')} do not exist.`,
        );
      }

      this.logger.info('END: validateItemsExist service');
      return existingItems;
    } catch (error) {
      this.logger.error(`Error in validateItemsExist:`, error);

      throw error;
    }
  }

  async upsertItem(
    organizationId: string,
    body: CreateItemDto,
  ) {
    this.logger.info('START: upsertItem service');
    try {
      const existingItem = await this.itemsRepository.findOne({
        where: {
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
          externalId: body.externalId,
        },
      });

      if (existingItem) {
        await this.itemsRepository.update(existingItem.itemId, {
          name: body.name,
          description: body.description,
          customFields: body.customFields,
        });
      } else {
        const newItem = this.itemsRepository.create({
          name: body.name,
          description: body.description,
          customFields: body.customFields,
          externalId: body.externalId,
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
        });
        await this.itemsRepository.save(newItem);
      }

      const savedItem = await this.itemsRepository.findOne({
        where: {
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
          externalId: body.externalId,
        },
      });

      this.logger.info('END: upsertItem service');
      return this.itemConverter.convert(savedItem!);
    } catch (error) {
      this.logger.error(`Error in upsertItem:`, error);

      throw new HttpException(
        'Failed to upsert item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async streamSalesByItemsReport(
    organizationId: string,
    from?: string,
    to?: string,
  ): Promise<PassThrough> {
    if (!from || !to) {
      throw new BadRequestException('Time period not configured for report');
    }

    const passThrough = new PassThrough();

    const csvStream = csvFormat({
      headers: true,
      quoteColumns: true,
    });

    csvStream.pipe(passThrough);

    const dbStream = await this.itemWiseMvRepository
      .createQueryBuilder('mv')
      .where('mv.organization_id = :organizationId', { organizationId })
      .andWhere('mv.date BETWEEN :start AND :end', {
        start: from,
        end: to,
      })
      .select([
        'mv.external_item_id AS external_item_id',
        'mv.item_name AS item_name',
        'SUM(mv.gross_sale) AS gross_sales',
        'SUM(mv.total_discount) AS total_discount',
        'SUM(mv.net_sale) AS net_sales',
        'SUM(mv.total_redemptions) AS total_redemptions',
      ])
      .groupBy('mv.external_item_id')
      .addGroupBy('mv.item_name')
      .orderBy('mv.item_name', 'ASC')
      .stream();

    dbStream.on('data', (row: any) => {
      csvStream.write({
        ItemName: row.item_name,
        GrossSales: row.gross_sales,
        Discount: row.total_discount,
        NetSales: row.net_sales,
        TotalRedemptions: row.total_redemptions,
        ExternalItemID: row.external_item_id,
      });
    });

    dbStream.on('end', () => csvStream.end());
    dbStream.on('error', (err) => {
      csvStream.end();
      passThrough.destroy(err);
    });

    return passThrough;
  }

}
