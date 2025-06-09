import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from '../services/organization.service';
import { OrganizationController } from '../controllers/organization.controller';
import { Organization } from '../entities/organization.entity';
import { OrganizationUser } from '../entities/organization-user.entity';
import { OrganizationSummaryMv } from '../entities/organization-summary.view';
import { OrganizationConverter } from '../converters/organization.converter';
import { OrganizationSummarySheetConverter } from '../converters/organization-summary-sheet.converter';
import { OrganizationsMv } from 'src/entities/organizations_mv.entity';
import { OrganizationsListConverter } from 'src/converters/organizations-list-converter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationUser,
      OrganizationSummaryMv,
      OrganizationsMv,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationConverter,
    OrganizationSummarySheetConverter,
    OrganizationsListConverter,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
