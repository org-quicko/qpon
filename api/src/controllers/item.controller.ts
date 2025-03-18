import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ItemsService } from '../services/item.service';
import { CreateItemDto, UpdateItemDto } from '../dtos';
import { LoggerService } from '../services/logger.service';
import { Permissions } from '../decorators/permission.decorator';
import { Item } from '../entities/item.entity';

@ApiTags('Items')
@Controller('/organizations/:organization_id/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private logger: LoggerService,
  ) {}

  /**
   * Create item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('create', Item)
  @Post()
  async createItem(
    @Param('organization_id') organizationId: string,
    @Body() body: CreateItemDto,
  ) {
    this.logger.info('START: createItem controller');

    const result = await this.itemsService.createItem(organizationId, body);

    this.logger.info('END: createItem controller');
    return { message: 'Successfully created item', result };
  }

  /**
   * Fetch items
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read_all', Item)
  @Get()
  async fetchItems(
    @Param('organization_id') organizationId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('name') name?: string,
    @Query('external_id') externalId?: string,
  ) {
    this.logger.info('START: fetchItems controller');

    const result = await this.itemsService.fetchItems(
      organizationId,
      skip,
      take,
      {
        name,
        externalId,
      },
    );

    this.logger.info('END: fetchItems controller');
    return { message: 'Successfully fetched items', result };
  }

  /**
   * Fetch item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', Item)
  @Get(':item_id')
  async fetchItem(@Param('item_id') itemId: string) {
    this.logger.info('START: fetchItem controller');

    const result = await this.itemsService.fetchItem(itemId);

    this.logger.info('END: fetchItem controller');
    return { message: 'Successfully fetched item', result };
  }

  /**
   * Update item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Item)
  @Patch(':item_id')
  async updateItem(
    @Param('item_id') itemId: string,
    @Body() body: UpdateItemDto,
  ) {
    this.logger.info('START: updateItem controller');

    const result = await this.itemsService.updateItem(itemId, body);

    this.logger.info('END: updateItem controller');
    return { message: 'Successfully updated item', result };
  }

  /**
   * Delete item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('delete', Item)
  @Delete(':item_id')
  async deleteItem(@Param('item_id') itemId: string) {
    this.logger.info('START: deleteItem controller');

    const result = await this.itemsService.deleteItem(itemId);

    this.logger.info('END: deleteItem controller');
    return { message: 'Successfully deleted item', result };
  }
}
