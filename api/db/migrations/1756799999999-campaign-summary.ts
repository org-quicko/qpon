import { MigrationInterface, QueryRunner } from 'typeorm';

export class CampaignSummary1756799999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS campaign_summary_mv CASCADE;
    `);

    // 1️⃣ Create campaign_summary_mv table
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

    // 2️⃣ Indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_summary_organization_id ON campaign_summary_mv (organization_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_summary_coupon_id ON campaign_summary_mv (coupon_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_summary_status ON campaign_summary_mv (status);
    `);

    // 3️⃣ Function to update campaign_summary_mv
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_campaign_summary_mv()
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO campaign_summary_mv (
          campaign_id,
          coupon_id,
          organization_id,
          name,
          budget,
          total_redemption_count,
          total_redemption_amount,
          active_coupon_code_count,
          status,
          created_at,
          updated_at
        )
        SELECT
          cp.campaign_id,
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
          GROUP BY campaign_id
        ) r ON cp.campaign_id = r.campaign_id
        LEFT JOIN (
          SELECT 
            campaign_id,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count
          FROM coupon_code
          GROUP BY campaign_id
        ) cc ON cp.campaign_id = cc.campaign_id
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

    // 4️⃣ Trigger functions for related tables
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_campaign_summary_update()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_campaign_summary_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 5️⃣ Triggers
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_campaign_summary_on_campaign
        AFTER INSERT OR UPDATE OR DELETE ON campaign
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_campaign_summary_update();

      CREATE TRIGGER trigger_update_campaign_summary_on_coupon_code
        AFTER INSERT OR UPDATE OR DELETE ON coupon_code
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_campaign_summary_update();

      CREATE TRIGGER trigger_update_campaign_summary_on_redemption
        AFTER INSERT OR UPDATE OR DELETE ON redemption
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_campaign_summary_update();
    `);

    // 6️⃣ Initialize data once
    await queryRunner.query(`SELECT update_campaign_summary_mv();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_campaign_summary_on_campaign ON campaign;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_campaign_summary_on_coupon_code ON coupon_code;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_campaign_summary_on_redemption ON redemption;`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_campaign_summary_update();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_campaign_summary_mv();`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_summary_organization_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_summary_coupon_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaign_summary_status;`);

    await queryRunner.query(`DROP TABLE IF EXISTS campaign_summary_mv;`);
  }
}
