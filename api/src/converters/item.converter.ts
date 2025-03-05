import { Injectable } from '@nestjs/common';
import { ItemDto } from '../dtos';
import { Item } from '../entities/item.entity';

@Injectable()
export class ItemConverter {
  convert(item: Item): ItemDto {
    const itemDto = new ItemDto();

    itemDto.itemId = item.itemId;
    itemDto.name = item.name;
    itemDto.description = item.description;
    itemDto.customFields = item.customFields;
    itemDto.externalId = item.externalId;
    itemDto.createdAt = item.createdAt;
    itemDto.updatedAt = item.updatedAt;

    return itemDto;
  }
}
