import { MigrationInterface, QueryRunner } from 'typeorm';

export class CouponSummaryAndDaily1756800000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS coupon_summary_mv CASCADE;
    `);

    // 2️⃣ Create main cumulative summary table
    await queryRunner.query(`
      CREATE TABLE coupon_summary_mv (
        coupon_id UUID PRIMARY KEY,
        organization_id UUID,
        total_redemption_count NUMERIC DEFAULT 0,
        total_redemption_amount NUMERIC DEFAULT 0,
        active_coupon_code_count NUMERIC DEFAULT 0,
        redeemed_coupon_code_count NUMERIC DEFAULT 0,
        active_campaign_count NUMERIC DEFAULT 0,
        total_campaign_count NUMERIC DEFAULT 0,
        budget NUMERIC DEFAULT 0,
        status VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 3️⃣ Create day-wise summary table (renamed)
    await queryRunner.query(`
      CREATE TABLE coupon_summary_day_wise_mv (
        coupon_id UUID,
        date DATE NOT NULL,
        organization_id UUID,
        total_redemption_count NUMERIC DEFAULT 0,
        total_redemption_amount NUMERIC DEFAULT 0,
        active_coupon_code_count NUMERIC DEFAULT 0,
        redeemed_coupon_code_count NUMERIC DEFAULT 0,
        active_campaign_count NUMERIC DEFAULT 0,
        total_campaign_count NUMERIC DEFAULT 0,
        budget NUMERIC DEFAULT 0,
        status VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (coupon_id, date)
      );
    `);

    // 4️⃣ Indexes for both
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_summary_org_id ON coupon_summary_mv (organization_id);
      CREATE INDEX IF NOT EXISTS idx_coupon_summary_status ON coupon_summary_mv (status);
      CREATE INDEX IF NOT EXISTS idx_coupon_summary_created_at ON coupon_summary_mv (created_at);
      CREATE INDEX IF NOT EXISTS idx_coupon_summary_updated_at ON coupon_summary_mv (updated_at);

      CREATE INDEX IF NOT EXISTS idx_coupon_day_summary_org_id ON coupon_summary_day_wise_mv (organization_id);
      CREATE INDEX IF NOT EXISTS idx_coupon_day_summary_status ON coupon_summary_day_wise_mv (status);
      CREATE INDEX IF NOT EXISTS idx_coupon_day_summary_date ON coupon_summary_day_wise_mv (date);
      CREATE INDEX IF NOT EXISTS idx_coupon_day_summary_created_at ON coupon_summary_day_wise_mv (created_at);
      CREATE INDEX IF NOT EXISTS idx_coupon_day_summary_updated_at ON coupon_summary_day_wise_mv (updated_at);
    `);

    // 5️⃣ Add indexes on source tables for efficient filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_redemption_created_at ON redemption (created_at);
      CREATE INDEX IF NOT EXISTS idx_coupon_code_updated_at ON coupon_code (updated_at);
      CREATE INDEX IF NOT EXISTS idx_campaign_updated_at ON campaign (updated_at);
    `);

    // 5️⃣ Update function for day-wise table
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_coupon_day_summary_mv()
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO coupon_summary_day_wise_mv (
          coupon_id,
          date,
          organization_id,
          total_redemption_count,
          total_redemption_amount,
          active_coupon_code_count,
          redeemed_coupon_code_count,
          active_campaign_count,
          total_campaign_count,
          budget,
          status,
          created_at,
          updated_at
        )
        SELECT
          c.coupon_id,
          CURRENT_DATE AS date,
          c.organization_id,
          COALESCE(r.total_redemption_count, 0),
          COALESCE(r.total_redemption_amount, 0),
          COALESCE(cc.active_coupon_code_count, 0),
          COALESCE(cc.redeemed_coupon_code_count, 0),
          COALESCE(camp.active_campaign_count, 0),
          COALESCE(camp.total_campaign_count, 0),
          COALESCE(camp.budget, 0),
          c.status,
          now(),
          now()
        FROM coupon c
        LEFT JOIN (
            SELECT 
                coupon_id,
                COUNT(redemption_id) AS total_redemption_count,
                SUM(discount) AS total_redemption_amount
            FROM redemption
            WHERE created_at >= CURRENT_DATE
              AND created_at < CURRENT_DATE + INTERVAL '1 day'
            GROUP BY coupon_id
        ) r ON c.coupon_id = r.coupon_id
        LEFT JOIN (
            SELECT 
                coupon_id,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count,
                SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) AS redeemed_coupon_code_count
            FROM coupon_code
            WHERE updated_at >= CURRENT_DATE
              AND updated_at < CURRENT_DATE + INTERVAL '1 day'
            GROUP BY coupon_id
        ) cc ON c.coupon_id = cc.coupon_id
        LEFT JOIN (
            SELECT 
                coupon_id,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_campaign_count,
                COUNT(campaign_id) AS total_campaign_count,
                SUM(budget) AS budget
            FROM campaign
            WHERE updated_at >= CURRENT_DATE
              AND updated_at < CURRENT_DATE + INTERVAL '1 day'
            GROUP BY coupon_id
        ) camp ON c.coupon_id = camp.coupon_id
        ON CONFLICT (coupon_id, date)
        DO UPDATE SET
          organization_id = EXCLUDED.organization_id,
          total_redemption_count = EXCLUDED.total_redemption_count,
          total_redemption_amount = EXCLUDED.total_redemption_amount,
          active_coupon_code_count = EXCLUDED.active_coupon_code_count,
          redeemed_coupon_code_count = EXCLUDED.redeemed_coupon_code_count,
          active_campaign_count = EXCLUDED.active_campaign_count,
          total_campaign_count = EXCLUDED.total_campaign_count,
          budget = EXCLUDED.budget,
          status = EXCLUDED.status,
          updated_at = now();
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 6️⃣ Update function for main summary table (depends on day summary)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_coupon_summary_mv()
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO coupon_summary_mv (
          coupon_id,
          organization_id,
          total_redemption_count,
          total_redemption_amount,
          active_coupon_code_count,
          redeemed_coupon_code_count,
          active_campaign_count,
          total_campaign_count,
          budget,
          status,
          created_at,
          updated_at
        )
        SELECT
          cd.coupon_id,
          cd.organization_id,
          SUM(cd.total_redemption_count),
          SUM(cd.total_redemption_amount),
          MAX(cd.active_coupon_code_count),
          SUM(cd.redeemed_coupon_code_count),
          MAX(cd.active_campaign_count),
          MAX(cd.total_campaign_count),
          SUM(cd.budget),
          cd.status,
          MIN(cd.created_at),
          now()
        FROM coupon_summary_day_wise_mv cd
        GROUP BY
          cd.coupon_id,
          cd.organization_id,
          cd.status
        ON CONFLICT (coupon_id)
        DO UPDATE SET
          organization_id = EXCLUDED.organization_id,
          total_redemption_count = EXCLUDED.total_redemption_count,
          total_redemption_amount = EXCLUDED.total_redemption_amount,
          active_coupon_code_count = EXCLUDED.active_coupon_code_count,
          redeemed_coupon_code_count = EXCLUDED.redeemed_coupon_code_count,
          active_campaign_count = EXCLUDED.active_campaign_count,
          total_campaign_count = EXCLUDED.total_campaign_count,
          budget = EXCLUDED.budget,
          status = EXCLUDED.status,
          updated_at = now();
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 7️⃣ Trigger for base tables → update only day summary
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_update_coupon_day_summary()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_coupon_day_summary_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 8️⃣ Trigger for day summary → update main summary
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_update_coupon_main_summary()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_coupon_summary_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 9️⃣ Attach triggers
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_coupon_day_summary_on_coupon
        AFTER INSERT OR UPDATE OR DELETE ON coupon
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_coupon_day_summary();

      CREATE TRIGGER trigger_update_coupon_day_summary_on_coupon_code
        AFTER INSERT OR UPDATE OR DELETE ON coupon_code
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_coupon_day_summary();

      CREATE TRIGGER trigger_update_coupon_day_summary_on_campaign
        AFTER INSERT OR UPDATE OR DELETE ON campaign
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_coupon_day_summary();

      CREATE TRIGGER trigger_update_coupon_day_summary_on_redemption
        AFTER INSERT OR UPDATE OR DELETE ON redemption
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_coupon_day_summary();

      CREATE TRIGGER trigger_update_coupon_main_summary_on_day_summary
        AFTER INSERT OR UPDATE OR DELETE ON coupon_summary_day_wise_mv
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_coupon_main_summary();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_main_summary_on_day_summary ON coupon_summary_day_wise_mv;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_day_summary_on_coupon ON coupon;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_day_summary_on_coupon_code ON coupon_code;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_day_summary_on_campaign ON campaign;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_day_summary_on_redemption ON redemption;`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_update_coupon_main_summary();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_update_coupon_day_summary();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_coupon_summary_mv();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_coupon_day_summary_mv();`);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_coupon_summary_org_id;
      DROP INDEX IF EXISTS idx_coupon_summary_status;
      DROP INDEX IF EXISTS idx_coupon_summary_created_at;
      DROP INDEX IF EXISTS idx_coupon_summary_updated_at;

      DROP INDEX IF EXISTS idx_coupon_day_summary_org_id;
      DROP INDEX IF EXISTS idx_coupon_day_summary_status;
      DROP INDEX IF EXISTS idx_coupon_day_summary_date;
      DROP INDEX IF EXISTS idx_coupon_day_summary_created_at;
      DROP INDEX IF EXISTS idx_coupon_day_summary_updated_at;

      DROP INDEX IF EXISTS idx_redemption_created_at;
      DROP INDEX IF EXISTS idx_coupon_code_updated_at;
      DROP INDEX IF EXISTS idx_campaign_updated_at;
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS coupon_summary_day_wise_mv;`);
    await queryRunner.query(`DROP TABLE IF EXISTS coupon_summary_mv;`);
  }
}
