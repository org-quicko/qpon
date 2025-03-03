import { Module } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from '../controllers/organization.controller';
import { Organization } from '../entities/organization.entity';
import { OrganizationUser } from 'src/entities/organization-user.entity';
import { OrganizationSummaryMv } from 'src/entities/organization-summary.view';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationUser, OrganizationSummaryMv])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
