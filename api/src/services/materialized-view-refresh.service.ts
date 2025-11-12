import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

@Injectable()
export class MaterializedViewRefreshService {
  private readonly logger = new Logger(MaterializedViewRefreshService.name);
  private readonly cronExpression: string;

  constructor(private readonly dataSource: DataSource) {
    this.cronExpression = process.env.REFRESH_MV_CRON || '*/30 * * * * *';
    this.logger.log(
      `MaterializedViewRefreshService initialized (Cron: ${this.cronExpression})`,
    );
  }

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

  /**
   * Cron job to refresh materialized views
   */
  @Cron(process.env.REFRESH_MV_CRON || '*/30 * * * * *', {
    name: 'refreshMaterializedViewsJob',
  })
  async refreshMaterializedViews() {
    this.logger.log('START: refreshMaterializedViews job');

    try {
      for (const view of this.materializedViews) {
        try {
          this.logger.verbose(`Refreshing materialized view: ${view}...`);
          await this.dataSource.query(`REFRESH MATERIALIZED VIEW ${view} WITH DATA;`);
          this.logger.log(`Successfully refreshed: ${view}`);
        } catch (error) {
          this.logger.error(`Failed to refresh ${view}`, error.stack);
        }
      }

      this.logger.log('END: refreshMaterializedViews job completed');
    } catch (error) {
      this.logger.error(`Error in refreshMaterializedViews job`, error.stack);

      throw new HttpException(
        'Failed to refresh materialized views',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
