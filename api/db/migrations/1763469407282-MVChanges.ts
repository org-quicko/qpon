import { MigrationInterface, QueryRunner } from "typeorm";
import { getMigrationSchema } from "../migration-utils";

export class MVChanges1763469407282 implements MigrationInterface {
    name = 'MVChanges1763469407282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = getMigrationSchema(queryRunner);

        // Drop existing materialized views if they exist
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "${schema}"."item_wise_day_wise_redemption_summary_mv"`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "${schema}"."customer_wise_day_wise_redemption_summary_mv"`);

        // -------------------------------------------
        // CUSTOMER WISE MV
        // -------------------------------------------
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW "${schema}"."customer_wise_day_wise_redemption_summary_mv" AS
            SELECT
                r.organization_id,
                r.customer_id,
                c.name AS customer_name,
                c.external_id AS customer_external_id,
                r.redemption_date AS date,
                COUNT(r.redemption_id) AS total_redemptions,
                SUM(r.base_order_value) AS gross_sale,
                SUM(r.discount) AS total_discount,
                SUM(r.base_order_value - r.discount) AS net_sale,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM "${schema}"."redemption" r
            JOIN "${schema}"."customer" c ON c.customer_id = r.customer_id
            WHERE r.organization_id IS NOT NULL
              AND r.customer_id IS NOT NULL
            GROUP BY
                r.organization_id,
                r.customer_id,
                c.name,
                c.external_id,
                r.redemption_date;
        `);

        // Create indexes for customer MV
        await queryRunner.query(`CREATE INDEX "idx_customer_wise_org" ON "${schema}"."customer_wise_day_wise_redemption_summary_mv" ("organization_id")`);
        await queryRunner.query(`CREATE INDEX "idx_customer_wise_customer" ON "${schema}"."customer_wise_day_wise_redemption_summary_mv" ("customer_id")`);
        await queryRunner.query(`CREATE INDEX "idx_customer_wise_date" ON "${schema}"."customer_wise_day_wise_redemption_summary_mv" ("date")`);

        // -------------------------------------------
        // ITEM WISE MV
        // -------------------------------------------
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW "${schema}"."item_wise_day_wise_redemption_summary_mv" AS
            SELECT
                r.organization_id,
                r.item_id,
                i.name AS item_name,
                i.external_id AS external_item_id,
                r.redemption_date AS date,
                COUNT(r.redemption_id) AS total_redemptions,
                SUM(r.base_order_value) AS gross_sale,
                SUM(r.discount) AS total_discount,
                SUM(r.base_order_value - r.discount) AS net_sale,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM "${schema}"."redemption" r
            JOIN "${schema}"."item" i ON i.item_id = r.item_id
            WHERE r.organization_id IS NOT NULL
              AND r.item_id IS NOT NULL
            GROUP BY
                r.organization_id,
                r.item_id,
                i.name,
                i.external_id,
                r.redemption_date;
        `);

        // Create indexes for item MV
        await queryRunner.query(`CREATE INDEX "idx_item_wise_org" ON "${schema}"."item_wise_day_wise_redemption_summary_mv" ("organization_id")`);
        await queryRunner.query(`CREATE INDEX "idx_item_wise_item" ON "${schema}"."item_wise_day_wise_redemption_summary_mv" ("item_id")`);
        await queryRunner.query(`CREATE INDEX "idx_item_wise_date" ON "${schema}"."item_wise_day_wise_redemption_summary_mv" ("date")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = getMigrationSchema(queryRunner);

        // Drop new indexes + views
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."idx_item_wise_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."idx_item_wise_item"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."idx_item_wise_org"`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "${schema}"."item_wise_day_wise_redemption_summary_mv"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."idx_customer_wise_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."idx_customer_wise_customer"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."idx_customer_wise_org"`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "${schema}"."customer_wise_day_wise_redemption_summary_mv"`);

        // Restore original item_wise view (older structure)
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW "${schema}"."item_wise_day_wise_redemption_summary_mv" AS
            SELECT
                r.organization_id,
                r.item_id,
                i.name AS item_name,
                r.redemption_date AS date,
                COUNT(r.redemption_id) AS total_redemptions,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM "${schema}"."redemption" r
            JOIN "${schema}"."item" i ON i.item_id = r.item_id
            WHERE r.organization_id IS NOT NULL
              AND r.item_id IS NOT NULL
            GROUP BY
                r.organization_id,
                r.item_id,
                i.name,
                r.redemption_date;
        `);

        // Restore indexes for original view
        await queryRunner.query(`CREATE INDEX "idx_item_wise_org" ON "${schema}"."item_wise_day_wise_redemption_summary_mv" ("organization_id")`);
        await queryRunner.query(`CREATE INDEX "idx_item_wise_item" ON "${schema}"."item_wise_day_wise_redemption_summary_mv" ("item_id")`);
        await queryRunner.query(`CREATE INDEX "idx_item_wise_date" ON "${schema}"."item_wise_day_wise_redemption_summary_mv" ("date")`);
    }
}
