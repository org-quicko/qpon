import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshRedemptionSummaryMVs1750000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing MVs if they exist
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS coupon_codes_wise_day_wise_redemption_summary_mv`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS item_wise_day_wise_redemption_summary_mv`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS day_wise_redemption_summary_mv`);

        // Recreate coupon_codes_wise_day_wise_redemption_summary_mv
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW coupon_codes_wise_day_wise_redemption_summary_mv AS
            SELECT
                r.organization_id,
                r.coupon_code_id,
                c.code AS coupon_code,
                r.redemption_date AS date,
                COUNT(r.redemption_id)::numeric AS total_redemptions,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM redemption r
            JOIN coupon_code c ON c.coupon_code_id = r.coupon_code_id
            WHERE r.organization_id IS NOT NULL
              AND r.coupon_code_id IS NOT NULL
            GROUP BY
                r.organization_id,
                r.coupon_code_id,
                c.code,
                r.redemption_date
        `);

        // Indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_ccdw_org ON coupon_codes_wise_day_wise_redemption_summary_mv (organization_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_ccdw_code ON coupon_codes_wise_day_wise_redemption_summary_mv (coupon_code_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_ccdw_date ON coupon_codes_wise_day_wise_redemption_summary_mv (date)`);


        // Recreate item_wise_day_wise_redemption_summary_mv
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW item_wise_day_wise_redemption_summary_mv AS
            SELECT
                r.organization_id,
                r.item_id,
                i.name AS item_name,
                r.redemption_date AS date,
                COUNT(r.redemption_id)::numeric AS total_redemptions,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM redemption r
            JOIN item i ON i.item_id = r.item_id
            WHERE r.organization_id IS NOT NULL
              AND r.item_id IS NOT NULL
            GROUP BY
                r.organization_id,
                r.item_id,
                i.name,
                r.redemption_date
        `);

        // Indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_iwdw_org ON item_wise_day_wise_redemption_summary_mv (organization_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_iwdw_item ON item_wise_day_wise_redemption_summary_mv (item_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_iwdw_date ON item_wise_day_wise_redemption_summary_mv (date)`);


        // Recreate day_wise_redemption_summary_mv
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW day_wise_redemption_summary_mv AS
            SELECT
                r.organization_id,
                r.redemption_date::text AS date,
                COUNT(r.redemption_id)::numeric AS total_redemptions_count,
                COALESCE(SUM(r.base_order_value), 0)::integer AS gross_sales_amount,
                COALESCE(SUM(r.discount), 0)::integer AS discount_amount,
                COALESCE(SUM(r.base_order_value - r.discount), 0)::integer AS net_sales_amount,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM redemption r
            WHERE r.organization_id IS NOT NULL
            GROUP BY r.organization_id, r.redemption_date
        `);

        // Indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_dwdw_org ON day_wise_redemption_summary_mv (organization_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_dwdw_date ON day_wise_redemption_summary_mv (date)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop created views
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS coupon_codes_wise_day_wise_redemption_summary_mv`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS item_wise_day_wise_redemption_summary_mv`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS day_wise_redemption_summary_mv`);
    }
}
