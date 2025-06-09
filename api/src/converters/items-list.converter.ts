import { Injectable } from '@nestjs/common';
import { PaginatedListConverter } from './paginated-list.converter';
import { Item } from 'src/entities/item.entity';
import { ItemDto } from 'src/dtos';
import { ItemConverter } from './item.converter';

@Injectable()
export class ItemsListConverter extends PaginatedListConverter<Item, ItemDto> {
  constructor() {
    const itemConverter = new ItemConverter();
    super(itemConverter);
  }
}
