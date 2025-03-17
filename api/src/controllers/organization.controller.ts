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
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';
import { LoggerService } from '../services/logger.service';
import { Public } from '../decorators/public.decorator';
import { Permissions } from 'src/decorators/permission.decorator';
import { Organization } from 'src/entities/organization.entity';
import { OrganizationSummaryMv } from 'src/entities/organization-summary.view';

@ApiTags('Organization')
@Controller('/organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private logger: LoggerService,
  ) {}

  /**
   * Create organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Public()
  @Post()
  async createOrganization(@Body() body: CreateOrganizationDto) {
    this.logger.info('START: createOrganization controller');

    const result = await this.organizationService.createOrganization(body);

    this.logger.info('END: createOrganization controller');
    return { message: 'Successfully created organization', result };
  }

  /**
   * Fetch organizations
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read_all', Organization)
  @Get()
  async fetchOrganizations(
    @Query('external_id') externalId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    this.logger.info('START: fetchOrganizations controller');

    const result = await this.organizationService.fetchOrganizations({
      externalId,
      skip,
      take,
    });

    this.logger.info('END: fetchOrganizations controller');
    return { message: 'Succesfully fetched organizations', result };
  }

  /**
   * Fetch organization summary
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', OrganizationSummaryMv)
  @Get(':organization_id/summary')
  async fetchOrganizationSummary(
    @Param('organization_id') organizationId: string,
  ) {
    this.logger.info('START: fetchOrganizationSummary controller');

    const result =
      await this.organizationService.fetchOrganizationSummary(organizationId);

    this.logger.info('END: fetchOrganizationSummary controller');
    return { message: 'Successfully fetched organization summary', result };
  }

  /**
   * Fetch organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read', Organization)
  @Get(':organization_id')
  async fetchOrganization(@Param('organization_id') organizationId: string) {
    this.logger.info('START: fetchOrganization controller');

    const result =
      await this.organizationService.fetchOrganization(organizationId);

    this.logger.info('END: fetchOrganization controller');
    return { message: 'Successfully fetched organization', result };
  }

  /**
   * Update organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Organization)
  @Patch(':organization_id')
  async updateOrganization(
    @Param('organization_id') organizationId: string,
    @Body() body: UpdateOrganizationDto,
  ) {
    this.logger.info('START: updateOrganization controller');

    const result = await this.organizationService.updateOrganization(
      organizationId,
      body,
    );

    this.logger.info('END: updateOrganization controller');
    return { message: 'Successfully updated organization', result };
  }

  /**
   * Delete organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('delete', Organization)
  @Delete(':organization_id')
  async deleteOrganization(@Param('organization_id') organizationId: string) {
    this.logger.info('START: deleteOrganization controller');

    const result =
      await this.organizationService.deleteOrganization(organizationId);

    this.logger.info('END: deleteOrganization controller');
    return { message: 'Successfully deleted organization', result };
  }
}
