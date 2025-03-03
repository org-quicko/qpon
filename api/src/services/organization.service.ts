
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationDto } from '../dtos';


@Injectable()
export class OrganizationService {
  
constructor(
    @InjectRepository(Organization) 
    private readonly organizationRepository: Repository<Organization>
) {}


  /**
   * Create organization
   */
  async createOrganization(@Body() body: OrganizationDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch organizations
   */
  async fetchOrganizations(externalId?: string, take?: number, skip?: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch organization
   */
  async fetchOrganization(organizationId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update organization
   */
  async updateOrganization(organizationId: string, @Body() body: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch organization summary
   */
  async fetchOrganizationSummary(organizationId: string, from?: string, to?: string) {
    throw new Error('Method not implemented.');
  }
}
