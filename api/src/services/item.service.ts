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
  Like,
  Repository,
} from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto, UpdateItemDto } from '../dtos';
import { LoggerService } from './logger.service';
import { ItemConverter } from '../converters/item.converter';
import { statusEnum } from '../enums';
import { CouponItem } from '../entities/coupon-item.entity';
import { ItemsListConverter } from 'src/converters/items-list.converter';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
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
          name: Like(body.name),
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
      this.logger.error(`Error in createItem: ${error.message}`, error);

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
      });

      if (!items || items.length == 0) {
        this.logger.warn('Items not found', organizationId);
        throw new NotFoundException('Items not found');
      }

      this.logger.info('END: fetchItems service');
      return this.itemListConverter.convert(items, skip, take, count);
    } catch (error) {
      this.logger.error(`Error in fetchItems: ${error.message}`, error);

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
      this.logger.error(`Error in fetchItem: ${error.message}`, error);

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
        `Error in fetchItemForValidation: ${error.message}`,
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

      await this.itemsRepository.update({ itemId }, body);

      const savedItem = await this.itemsRepository.findOne({
        where: {
          itemId,
        },
      });

      this.logger.info('END: updateItem service');
      return this.itemConverter.convert(savedItem!);
    } catch (error) {
      this.logger.error(`Error in updateItem: ${error.message}`, error);

      if (error instanceof NotFoundException) {
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
        this.logger.error(`Error in deleteItem: ${error.message}`, error);

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
      this.logger.error(`Error in validateItemsExist: ${error.message}`, error);

      throw error;
    }
  }
}
