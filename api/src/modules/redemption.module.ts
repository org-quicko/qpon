import { Module } from '@nestjs/common';
import { RedemptionsService } from '../services/redemption.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionsController } from '../controllers/redemption.controller';
import { Redemption } from '../entities/redemption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Redemption])],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
})
export class RedemptionsModule {}
