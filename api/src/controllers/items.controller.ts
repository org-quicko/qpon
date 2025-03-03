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
import { ItemsService } from '../services/items.service';
import { ItemDto } from '../dtos';

@ApiTags('Items')
@Controller('/:organization_id/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Create item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post()
  async createItem(
    @Param('organization_id') organizationId: string,
    @Body() body: ItemDto,
  ) {
    return this.itemsService.createItem(organizationId, body);
  }

  /**
   * Fetch items
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get()
  async fetchItems(
    @Param('organization_id') organizationId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('name') name?: string,
  ) {
    return this.itemsService.fetchItems(organizationId, skip, take, name);
  }

  /**
   * Update item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(':item_id')
  async updateItem(
    @Param('organization_id') organizationId: string,
    @Param('item_id') itemId: string,
    @Body() body: any,
  ) {
    return this.itemsService.updateItem(organizationId, itemId, body);
  }

  /**
   * Delete item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Delete(':item_id')
  async deleteItem(
    @Param('organization_id') organizationId: string,
    @Param('item_id') itemId: string,
  ) {
    return this.itemsService.deleteItem(organizationId, itemId);
  }

  /**
   * Fetch item
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get(':item_id')
  async fetchItem(
    @Param('organization_id') organizationId: string,
    @Param('item_id') itemId: string,
  ) {
    return this.itemsService.fetchItem(organizationId, itemId);
  }
}
