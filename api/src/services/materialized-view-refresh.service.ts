import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { LoggerService } from './logger.service';

@Injectable()
export class MaterializedViewRefreshService implements OnModuleInit {
  private readonly cronExpression: string;

  // List of materialized views to refresh
  private readonly materializedViews = [
    'campaign_summary_mv',
    'coupon_summary_mv',
    'organization_summary_mv',
    'organizations_mv',
    'coupon_codes_wise_day_wise_redemption_summary_mv',
    'day_wise_redemption_summary_mv',
    'item_wise_day_wise_redemption_summary_mv',
  ];

  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {
    this.cronExpression = process.env.REFRESH_MV_CRON || '*/30 * * * * *';
  }

  /**
   * Lifecycle hook — called once all dependencies are ready
   */
  onModuleInit() {
    this.logger.info(
      `MaterializedViewRefreshService initialized (Cron: ${this.cronExpression})`,
    );
  }

  /**
   * Cron job to refresh materialized views
   */
  @Cron(process.env.REFRESH_MV_CRON || '*/30 * * * * *', {
    name: 'refreshMaterializedViewsJob',
  })
  async refreshMaterializedViews() {
    this.logger.info('START: refreshMaterializedViews job');

    try {
      for (const view of this.materializedViews) {
        try {
          this.logger.info(`Refreshing materialized view: ${view}...`);
          await this.dataSource.query(`REFRESH MATERIALIZED VIEW ${view} WITH DATA;`);
          this.logger.info(`Successfully refreshed: ${view}`);
        } catch (error) {
          this.logger.error(`Failed to refresh ${view}`, error);
        }
      }

      this.logger.info('END: refreshMaterializedViews job completed');
    } catch (error) {
      this.logger.error('Error in refreshMaterializedViews job', error);

      throw new HttpException(
        'Failed to refresh materialized views',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
