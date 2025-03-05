import { Module } from '@nestjs/common';
import { ItemsService } from '../services/items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from '../controllers/items.controller';
import { Item } from '../entities/item.entity';
import { ItemConverter } from '../converters/item.converter';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService, ItemConverter],
})
export class ItemsModule {}
