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
import { OrganizationDto } from '../dtos';

@ApiTags('Organization')
@Controller('/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Create organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post()
  async createOrganization(@Body() body: OrganizationDto) {
    return this.organizationService.createOrganization(body);
  }

  /**
   * Fetch organizations
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get()
  async fetchOrganizations(
    @Query('external_id') externalId?: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.organizationService.fetchOrganizations(externalId, take, skip);
  }

  /**
   * Fetch organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get(':organization_id')
  async fetchOrganization(@Param('organization_id') organizationId: string) {
    return this.organizationService.fetchOrganization(organizationId);
  }

  /**
   * Update organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(':organization_id')
  async updateOrganization(
    @Param('organization_id') organizationId: string,
    @Body() body: any,
  ) {
    return this.organizationService.updateOrganization(organizationId, body);
  }

  /**
   * Delete organization
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Delete(':organization_id')
  async deleteOrganization(@Param('organization_id') organizationId: string) {
    return this.organizationService.deleteOrganization(organizationId);
  }

  /**
   * Fetch organization summary
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get(':organization_id/reports')
  async fetchOrganizationSummary(
    @Param('organization_id') organizationId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.organizationService.fetchOrganizationSummary(
      organizationId,
      from,
      to,
    );
  }
}
