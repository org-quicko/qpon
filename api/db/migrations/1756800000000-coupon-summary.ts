import { MigrationInterface, QueryRunner } from 'typeorm';

export class CouponSummary1756800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS coupon_summary_mv CASCADE;
    `);

    // 1️⃣ Create coupon_summary_mv table
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

    // 2️⃣ Indexes for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_summary_organization_id ON coupon_summary_mv (organization_id);
      CREATE INDEX IF NOT EXISTS idx_coupon_summary_status ON coupon_summary_mv (status);
    `);

    // 3️⃣ Function to update coupon_summary_mv
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
          c.coupon_id,
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
            GROUP BY coupon_id
        ) r ON c.coupon_id = r.coupon_id
        LEFT JOIN (
            SELECT 
                coupon_id,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count,
                SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) AS redeemed_coupon_code_count
            FROM coupon_code
            GROUP BY coupon_id
        ) cc ON c.coupon_id = cc.coupon_id
        LEFT JOIN (
            SELECT 
                coupon_id,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_campaign_count,
                COUNT(campaign_id) AS total_campaign_count,
                SUM(budget) AS budget
            FROM campaign
            GROUP BY coupon_id
        ) camp ON c.coupon_id = camp.coupon_id
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

    // 4️⃣ Trigger wrapper function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_coupon_summary_update()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_coupon_summary_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 5️⃣ Triggers on dependent tables
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_coupon_summary_on_coupon
        AFTER INSERT OR UPDATE OR DELETE ON coupon
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_coupon_summary_update();

      CREATE TRIGGER trigger_update_coupon_summary_on_coupon_code
        AFTER INSERT OR UPDATE OR DELETE ON coupon_code
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_coupon_summary_update();

      CREATE TRIGGER trigger_update_coupon_summary_on_redemption
        AFTER INSERT OR UPDATE OR DELETE ON redemption
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_coupon_summary_update();

      CREATE TRIGGER trigger_update_coupon_summary_on_campaign
        AFTER INSERT OR UPDATE OR DELETE ON campaign
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_coupon_summary_update();
    `);

    // 6️⃣ Initialize data once
    await queryRunner.query(`SELECT update_coupon_summary_mv();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_summary_on_coupon ON coupon;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_summary_on_coupon_code ON coupon_code;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_summary_on_redemption ON redemption;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_coupon_summary_on_campaign ON campaign;`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_coupon_summary_update();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_coupon_summary_mv();`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coupon_summary_organization_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coupon_summary_status;`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS coupon_summary_mv;`);
  }
}
