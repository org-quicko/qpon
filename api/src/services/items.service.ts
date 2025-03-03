
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { ItemDto } from '../dtos';


@Injectable()
export class ItemsService {
  
constructor(
    @InjectRepository(Item) 
    private readonly itemsRepository: Repository<Item>
) {}


  /**
   * Create item
   */
  async createItem(organizationId: string, @Body() body: ItemDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch items
   */
  async fetchItems(organizationId: string, skip?: number, take?: number, name?: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update item
   */
  async updateItem(organizationId: string, itemId: string, @Body() body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete item
   */
  async deleteItem(organizationId: string, itemId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch item
   */
  async fetchItem(organizationId: string, itemId: string) {
    throw new Error('Method not implemented.');
  }
}
