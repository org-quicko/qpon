import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropMaterializedViews1756800000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS organizations_mv CASCADE;
    `);

    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS coupon_summary_mv CASCADE;
    `);

    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS campaign_summary_mv CASCADE;
    `);
  }

  public async down(): Promise<void> {
  }
}
