import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from '../services/organization.service';
import { OrganizationController } from '../controllers/organization.controller';
import { Organization } from '../entities/organization.entity';
import { OrganizationUser } from '../entities/organization-user.entity';
import { OrganizationSummaryMv } from '../entities/organization-summary.view';
import { OrganizationConverter } from '../converters/organization.converter';
import { OrganizationSummarySheetConverter } from '../converters/organization-summary-sheet.converter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationUser,
      OrganizationSummaryMv,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationConverter,
    OrganizationSummarySheetConverter,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
