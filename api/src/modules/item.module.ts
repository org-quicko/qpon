import { Module } from '@nestjs/common';
import { ItemsService } from '../services/item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from '../controllers/item.controller';
import { Item } from '../entities/item.entity';
import { ItemConverter } from '../converters/item.converter';
import { ItemsListConverter } from '../converters/items-list.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService, ItemConverter, ItemsListConverter],
  exports: [ItemsService],
})
export class ItemsModule {}
