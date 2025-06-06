import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';
import { LoggerService } from './logger.service';
import { OrganizationConverter } from '../converters/organization.converter';
import { QueryOptionsInterface } from '../interfaces/queryOptions.interface';
import { OrganizationSummaryMv } from '../entities/organization-summary.view';
import { OrganizationSummarySheetConverter } from '../converters/organization-summary-sheet.converter';
import { OrganizationsMv } from 'src/entities/organizations_mv.entity';
import { OrganizationsListConverter } from 'src/converters/organizations-list-converter';
import { sortOrderEnum } from 'src/enums';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationSummaryMv)
    private readonly organizationSummaryMvRepository: Repository<OrganizationSummaryMv>,
    @InjectRepository(OrganizationsMv)
    private readonly organizationsMvRepository: Repository<OrganizationsMv>,
    private organizationConverter: OrganizationConverter,
    private organizationSummarySheetConverter: OrganizationSummarySheetConverter,
    private organizationsListConverter: OrganizationsListConverter,
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
        externalId: body?.externalId,
      });

      const savedOrganization =
        await this.organizationRepository.save(organizationEntity);

      this.logger.info('END: createOrganization service');
      return this.organizationConverter.convert(savedOrganization);
    } catch (error) {
      this.logger.error(`Error in createOrganization:`, error);

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
  async fetchOrganizations(
    queryOptions: QueryOptionsInterface,
    sortBy?: string,
    sortOrder?: sortOrderEnum,
  ) {
    this.logger.info('START: fetchOrganizations service');
    try {
      const whereOptions = {};

      if (queryOptions['externalId']) {
        whereOptions['externalId'] = queryOptions.externalId;
        delete queryOptions['externalId'];
      }

      let nameFilter: string = '';

      if (queryOptions.name) {
        nameFilter = queryOptions.name;
        delete queryOptions.name;
      }

      const [organizations, count] =
        await this.organizationsMvRepository.findAndCount({
          where: {
            ...whereOptions,
            ...(nameFilter && { name: ILike(`%${nameFilter}%`) }),
          },
          ...(sortBy && { order: { [sortBy]: sortOrder } }),
          ...queryOptions,
        });

      if (!organizations || organizations.length == 0) {
        this.logger.warn('Organizations not found');
      }

      this.logger.info('END: fetchOrganizations service');
      return this.organizationsListConverter.convert(
        organizations,
        count,
        queryOptions.skip,
        queryOptions.take,
      );
    } catch (error) {
      this.logger.error(`Error in fetchOrganization:`, error);

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
    this.logger.info('START: fetchOrganization service');
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
      this.logger.error(`Error in fetchOrganization:`, error);

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
      this.logger.error(`Error in updateOrganization:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

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
      this.logger.error(`Error in updateOrganization:`, error);

      throw new HttpException(
        'Failed to delete organization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch organization summary
   */
  async fetchOrganizationSummary(organizationId: string) {
    this.logger.info('START: fetchOrganizationSummary service');
    try {
      const organizationSummary =
        await this.organizationSummaryMvRepository.findOne({
          where: {
            organizationId,
          },
        });

      if (!organizationSummary) {
        this.logger.warn('Unable to find summary for this organization');
        throw new NotFoundException(
          'Unable to find summary for this organization',
        );
      }

      this.logger.info('END: fetchOrganizationSummary service');
      return this.organizationSummarySheetConverter.convert(
        organizationSummary,
      );
    } catch (error) {
      this.logger.error(
        `Error in fetchOrganizationSummary:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch organization summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
