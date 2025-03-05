import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';
import { LoggerService } from './logger.service';
import { OrganizationConverter } from '../converters/organization.converter';
import { QueryOptionsInterface } from '../interfaces/queryOptions.interface';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private organizationConverter: OrganizationConverter,
    private logger: LoggerService,
  ) {}

  /**
   * Create organization
   */
  async createOrganization(body: CreateOrganizationDto) {
    this.logger.info('START: createOrganization service');
    try {
      const organizationEntity = this.organizationRepository.create({
        name: body.name,
        currency: body?.currency,
        themeColour: body.themeColour ? body.themeColour : 'default theme',
        slug: body.slug
          ? body.slug
          : body.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        externalId: body?.externalId,
      });

      const savedOrganization =
        await this.organizationRepository.save(organizationEntity);

      this.logger.info('END: createOrganization service');
      return this.organizationConverter.convert(savedOrganization);
    } catch (error) {
      this.logger.error(`Error in createOrganization: ${error.message}`, error);

      if (error.name === 'QueryFailedError') {
        throw new HttpException(
          'Organization with this name or slug already exists',
          HttpStatus.CONFLICT,
        );
      }

      if (error.name === 'ValidationError' || error.status === 400) {
        throw new HttpException(
          error.message || 'Validation failed',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Failed to create organization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch organizations
   */
  async fetchOrganizations(queryOptions: QueryOptionsInterface) {
    this.logger.info('START: fetchOrganizations service');
    try {
      const whereOptions = {};

      if (queryOptions['externalId']) {
        whereOptions['externalId'] = queryOptions.externalId;
        delete queryOptions['externalId'];
      }

      const organizations = await this.organizationRepository.find({
        where: {
          ...whereOptions,
        },
        ...queryOptions,
      });

      if (!organizations || organizations.length == 0) {
        this.logger.warn('Organizations not found');
        throw new NotFoundException('Organizations not found');
      }

      this.logger.info('END: fetchOrganizations service');
      return organizations.map((organization) =>
        this.organizationConverter.convert(organization),
      );
    } catch (error) {
      this.logger.error(`Error in fetchOrganization: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch organization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch organization
   */
  async fetchOrganization(organizationId: string) {
    this.logger.info('START: getchOrganization service');
    try {
      const organization = await this.organizationRepository.findOne({
        where: {
          organizationId,
        },
      });

      if (!organization) {
        this.logger.warn('Organization not found');
        throw new NotFoundException('Organization not found');
      }

      this.logger.info('END: fetchOrganization service');
      return this.organizationConverter.convert(organization);
    } catch (error) {
      this.logger.error(`Error in fetchOrganization: ${error.message}`, error);

      throw new HttpException(
        'Failed to fetch organization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    body: UpdateOrganizationDto,
  ) {
    this.logger.info('START: updateOrganization service');
    try {
      const organiztion = await this.organizationRepository.findOne({
        where: {
          organizationId,
        },
      });

      if (!organiztion) {
        this.logger.warn('Organization not found');
        throw new NotFoundException('Organization not found');
      }

      await this.organizationRepository.update(organizationId, body);

      const updatedOrganization = await this.organizationRepository.findOne({
        where: {
          organizationId,
        },
      });

      if (!updatedOrganization) {
        this.logger.warn('Updated organization not found');
        throw new NotFoundException('Updated organization not found');
      }

      this.logger.info('END: updateOrganization service');
      return this.organizationConverter.convert(updatedOrganization);
    } catch (error) {
      this.logger.error(`Error in updateOrganization: ${error.message}`, error);

      throw new HttpException(
        'Failed to update organization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string) {
    this.logger.info('START: deleteOrganization service');
    try {
      const organiztion = await this.organizationRepository.findOne({
        where: {
          organizationId,
        },
      });

      if (!organiztion) {
        this.logger.warn('Organization not found');
        throw new NotFoundException('Organization not found');
      }

      await this.organizationRepository.delete(organizationId);

      this.logger.info('END: deleteOrganization service');
      return this.organizationConverter.convert(organiztion);
    } catch (error) {
      this.logger.error(`Error in updateOrganization: ${error.message}`, error);

      throw new HttpException(
        'Failed to delete organization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch organization summary
   */
  async fetchOrganizationSummary(
    organizationId: string,
    from?: string,
    to?: string,
  ) {
    throw new Error('Method not implemented.');
  }
}
