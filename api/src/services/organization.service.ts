import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';
import { LoggerService } from './logger.service';
import { OrganizationConverter } from '../converters/organization.converter';
import { QueryOptionsInterface } from '../interfaces/queryOptions.interface';
import { OrganizationSummaryMv } from '../entities/organization-summary.view';
import { OrganizationSummaryWorkbookConverter } from '../converters/organization-summary';
import { OrganizationsMv } from 'src/entities/organizations_mv.entity';
import { OrganizationsListConverter } from 'src/converters/organizations-list-converter';
import { sortOrderEnum } from 'src/enums';
import { ItemWiseDayWiseRedemptionSummaryMv } from 'src/entities/item-wise-day-wise-redemption-summary-mv';
import { ItemsSummaryWorkbookConverter } from 'src/converters/items-summary/items-summary-workbook.converter';
import { CouponCodesWiseDayWiseRedemptionSummaryMv } from 'src/entities/coupon-codes-wise-day-wise-redemption-summary-mv';
import { CouponCodeSummaryWorkbookConverter } from 'src/converters/coupon-codes-summary';
import { DayWiseRedemptionSummaryMv } from 'src/entities/day-wise-redemption-summary-mv';
import { RedemptionSummaryWorkbookConverter } from 'src/converters/day-wise-redemption-summary';

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
    private organizationSummaryWorkbookConverter: OrganizationSummaryWorkbookConverter,
    private itemsSummaryWorkbookConverter: ItemsSummaryWorkbookConverter,
    private couponCodeSummaryWorkbookConverter: CouponCodeSummaryWorkbookConverter,
    private organizationsListConverter: OrganizationsListConverter,
    private RedemptionSummaryWorkbookConverter: RedemptionSummaryWorkbookConverter,
    private logger: LoggerService,
    @InjectRepository(ItemWiseDayWiseRedemptionSummaryMv)
    private readonly itemSummaryMvRepository: Repository<ItemWiseDayWiseRedemptionSummaryMv>,
    @InjectRepository(CouponCodesWiseDayWiseRedemptionSummaryMv)
    private readonly couponCodeSummaryMvRepository: Repository<CouponCodesWiseDayWiseRedemptionSummaryMv>,
    @InjectRepository(DayWiseRedemptionSummaryMv)
    private readonly daywiseRedemptionSummaryMVRepository: Repository<DayWiseRedemptionSummaryMv>,
  ) { }

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
      return this.organizationSummaryWorkbookConverter.convert(
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

  /**
   * Fetch top 5 items summary by total redemptions (org-wise)
   */
  async getItemWiseSummary(
    organizationId: string,
    startDate?: string,
    endDate?: string,
  ) {
    this.logger.info('START: getItemWiseSummary service');

    try {

      this.logger.debug(
        `Fetching top 5 items for organizationId=${organizationId}`,
      );

      const qb = this.itemSummaryMvRepository
        .createQueryBuilder('summary')
        .select('summary.organization_id', 'organizationId')
        .addSelect('summary.item_id', 'itemId')
        .addSelect('summary.item_name', 'itemName')
        .addSelect('SUM(summary.total_redemptions)', 'totalRedemptions')
        .addSelect('MAX(summary.created_at)', 'createdAt')
        .addSelect('MAX(summary.updated_at)', 'updatedAt')
        .addSelect('MAX(summary.date)', 'date')
        .where('summary.organization_id = :orgId', { orgId: organizationId })
        .groupBy('summary.organization_id')
        .addGroupBy('summary.item_id')
        .addGroupBy('summary.item_name')
        .orderBy('"totalRedemptions"', 'DESC')
        .limit(5);

      // optional date filter
      if (startDate && endDate) {
        qb.andWhere('summary.date BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        });

        this.logger.debug(
          `Date filter applied: BETWEEN ${startDate} AND ${endDate}`,
        );
      } else {
        this.logger.info('No date filter applied');
      }

      const rows = await qb.getRawMany();

      this.logger.debug(`Fetched ${rows.length} item summary records`);

      const converted = this.itemsSummaryWorkbookConverter.convert(rows);

      this.logger.info('END: getItemWiseSummary service');
      return converted;
    } catch (error) {
      this.logger.error('Error in getItemWiseSummary:', error);

      if (error instanceof BadRequestException) throw error;

      throw new HttpException(
        'Failed to fetch item-wise summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  /**
   * Fetch top 5 coupon codes summary by total redemptions (org-wise)
   */
  async getCouponCodeWiseSummary(
    organizationId: string,
    startDate?: string,
    endDate?: string,
  ) {
    this.logger.info('START: getCouponCodeWiseSummary service');

    try {

      this.logger.debug(
        `Fetching top 5 coupon codes for organizationId=${organizationId}`,
      );

      const qb = this.couponCodeSummaryMvRepository
        .createQueryBuilder('summary')
        .select('summary.organization_id', 'organizationId')
        .addSelect('summary.coupon_code', 'couponCode')
        .addSelect('SUM(summary.total_redemptions)', 'totalRedemptions')
        .addSelect('MAX(summary.created_at)', 'createdAt')
        .addSelect('MAX(summary.updated_at)', 'updatedAt')
        .addSelect('MAX(summary.date)', 'date')
        .where('summary.organization_id = :orgId', { orgId: organizationId })
        .groupBy('summary.organization_id')
        .addGroupBy('summary.coupon_code')
        .orderBy('"totalRedemptions"', 'DESC')   // <-- using alias
        .limit(5);

      // Optional date filter
      if (startDate && endDate) {
        qb.andWhere('summary.date BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        });

        this.logger.debug(
          `Date filter applied: BETWEEN ${startDate} AND ${endDate}`,
        );
      } else {
        this.logger.info('No date filter applied');
      }

      const rows = await qb.getRawMany();

      this.logger.debug(`Fetched ${rows.length} coupon code summary records`);

      const converted =
        this.couponCodeSummaryWorkbookConverter.convert(rows);

      this.logger.info('END: getCouponCodeWiseSummary service');
      return converted;
    } catch (error) {
      this.logger.error('Error in getCouponCodeWiseSummary:', error);

      if (error instanceof BadRequestException) throw error;

      throw new HttpException(
        'Failed to fetch coupon-code-wise summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  /**
   * Fetch day-wise redemption summary (optionally filtered by date range)
   */
  async getDayWiseRedemptionSummary(
    organizationId: string,
    startDate?: string,
    endDate?: string,
  ) {
    this.logger.info('START: getDayWiseRedemptionSummary service');

    try {

      let dateFilter: any = {};
      const fromDate = startDate ? new Date(startDate) : null;
      const toDate = endDate ? new Date(endDate) : null;

      if (fromDate && toDate) {
        dateFilter = { date: Between(fromDate, toDate) };
        this.logger.debug(
          `Date filter applied: BETWEEN ${fromDate.toISOString()} AND ${toDate.toISOString()}`,
        );
      }

      this.logger.debug(
        `Fetching day-wise redemption summary for organizationId=${organizationId}`,
      );

      const results = await this.daywiseRedemptionSummaryMVRepository.find({
        where: {
          organizationId,
          ...dateFilter,
        },
        order: { date: 'ASC' },
      });

      this.logger.debug(
        `Fetched ${results.length} records from dayWiseRedemptionSummaryRepo`,
      );

      const workbook =
        this.RedemptionSummaryWorkbookConverter.convert(results);

      this.logger.info('END: getDayWiseRedemptionSummary service');
      return workbook;
    } catch (error) {
      this.logger.error('Error in getDayWiseRedemptionSummary:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch day-wise redemption summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
