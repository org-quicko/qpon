import { MigrationInterface, QueryRunner } from 'typeorm';

export class CampaignSummaryAndDaily1756800000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // 2️⃣ Create main cumulative summary table
    await queryRunner.query(`
      CREATE TABLE campaign_summary_mv (
        campaign_id UUID PRIMARY KEY,
        coupon_id UUID,
        organization_id UUID,
        name VARCHAR,
        budget NUMERIC,
        total_redemption_count NUMERIC DEFAULT 0,
        total_redemption_amount NUMERIC DEFAULT 0,
        active_coupon_code_count NUMERIC DEFAULT 0,
        status VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 3️⃣ Create day-wise summary table (renamed)
    await queryRunner.query(`
      CREATE TABLE campaign_summary_day_wise_mv (
        campaign_id UUID,
        date DATE NOT NULL,
        coupon_id UUID,
        organization_id UUID,
        name VARCHAR,
        budget NUMERIC,
        total_redemption_count NUMERIC DEFAULT 0,
        total_redemption_amount NUMERIC DEFAULT 0,
        active_coupon_code_count NUMERIC DEFAULT 0,
        status VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (campaign_id, date)
      );
    `);

    // 4️⃣ Create indexes for both
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_summary_org_id ON campaign_summary_mv (organization_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_summary_coupon_id ON campaign_summary_mv (coupon_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_summary_status ON campaign_summary_mv (status);

      CREATE INDEX IF NOT EXISTS idx_campaign_day_summary_org_id ON campaign_summary_day_wise_mv (organization_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_day_summary_coupon_id ON campaign_summary_day_wise_mv (coupon_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_day_summary_status ON campaign_summary_day_wise_mv (status);
      CREATE INDEX IF NOT EXISTS idx_campaign_day_summary_date ON campaign_summary_day_wise_mv (date);
    `);

    // 5️⃣ Update function for campaign_summary_day_wise_mv
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_campaign_day_summary_mv()
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO campaign_summary_day_wise_mv (
          campaign_id, date, coupon_id, organization_id, name, budget,
          total_redemption_count, total_redemption_amount, active_coupon_code_count,
          status, created_at, updated_at
        )
        SELECT
          cp.campaign_id,
          CURRENT_DATE AS date,
          cp.coupon_id,
          c.organization_id,
          cp.name,
          cp.budget,
          COALESCE(r.total_redemption_count, 0),
          COALESCE(r.total_redemption_amount, 0),
          COALESCE(cc.active_coupon_code_count, 0),
          cp.status,
          cp.created_at,
          now()
        FROM campaign cp
        LEFT JOIN coupon c ON cp.coupon_id = c.coupon_id
        LEFT JOIN (
          SELECT 
            campaign_id,
            COUNT(redemption_id) AS total_redemption_count,
            SUM(discount) AS total_redemption_amount
          FROM redemption
          WHERE created_at::date = CURRENT_DATE
          GROUP BY campaign_id
        ) r ON cp.campaign_id = r.campaign_id
        LEFT JOIN (
          SELECT 
            campaign_id,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count
          FROM coupon_code
          WHERE updated_at::date = CURRENT_DATE
          GROUP BY campaign_id
        ) cc ON cp.campaign_id = cc.campaign_id
        ON CONFLICT (campaign_id, date)
        DO UPDATE SET
          coupon_id = EXCLUDED.coupon_id,
          organization_id = EXCLUDED.organization_id,
          name = EXCLUDED.name,
          budget = EXCLUDED.budget,
          total_redemption_count = EXCLUDED.total_redemption_count,
          total_redemption_amount = EXCLUDED.total_redemption_amount,
          active_coupon_code_count = EXCLUDED.active_coupon_code_count,
          status = EXCLUDED.status,
          updated_at = now();
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 6️⃣ Update function for main summary (depends on day-wise)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_campaign_summary_mv()
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO campaign_summary_mv (
          campaign_id, coupon_id, organization_id, name, budget,
          total_redemption_count, total_redemption_amount, active_coupon_code_count,
          status, created_at, updated_at
        )
        SELECT
          cd.campaign_id,
          cd.coupon_id,
          cd.organization_id,
          cd.name,
          cd.budget,
          SUM(cd.total_redemption_count),
          SUM(cd.total_redemption_amount),
          MAX(cd.active_coupon_code_count),
          cd.status,
          MIN(cd.created_at),
          now()
        FROM campaign_summary_day_wise_mv cd
        GROUP BY
          cd.campaign_id,
          cd.coupon_id,
          cd.organization_id,
          cd.name,
          cd.budget,
          cd.status
        ON CONFLICT (campaign_id)
        DO UPDATE SET
          coupon_id = EXCLUDED.coupon_id,
          organization_id = EXCLUDED.organization_id,
          name = EXCLUDED.name,
          budget = EXCLUDED.budget,
          total_redemption_count = EXCLUDED.total_redemption_count,
          total_redemption_amount = EXCLUDED.total_redemption_amount,
          active_coupon_code_count = EXCLUDED.active_coupon_code_count,
          status = EXCLUDED.status,
          updated_at = now();
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 7️⃣ Trigger for base tables → update day summary
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_update_day_summary()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_campaign_day_summary_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 8️⃣ Trigger for day summary → update main summary
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_update_main_summary()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_campaign_summary_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 9️⃣ Attach triggers
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_day_summary_on_campaign
        AFTER INSERT OR UPDATE OR DELETE ON campaign
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_day_summary();

      CREATE TRIGGER trigger_update_day_summary_on_coupon_code
        AFTER INSERT OR UPDATE OR DELETE ON coupon_code
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_day_summary();

      CREATE TRIGGER trigger_update_day_summary_on_redemption
        AFTER INSERT OR UPDATE OR DELETE ON redemption
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_day_summary();

      CREATE TRIGGER trigger_update_main_summary_on_day_summary
        AFTER INSERT OR UPDATE OR DELETE ON campaign_summary_day_wise_mv
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_update_main_summary();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_main_summary_on_day_summary ON campaign_summary_day_wise_mv;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_day_summary_on_campaign ON campaign;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_day_summary_on_coupon_code ON coupon_code;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_day_summary_on_redemption ON redemption;`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_update_main_summary();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_update_day_summary();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_campaign_summary_mv();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_campaign_day_summary_mv();`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_summary_org_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_summary_coupon_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_summary_status;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_day_summary_org_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_day_summary_coupon_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_day_summary_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_day_summary_date;`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_summary_day_wise_mv;`);
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_summary_mv;`);
  }
}
