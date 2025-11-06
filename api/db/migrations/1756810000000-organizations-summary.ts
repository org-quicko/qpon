import { MigrationInterface, QueryRunner } from 'typeorm';

export class Organizations1756810000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS organizations_mv CASCADE;
    `);

    // 1️⃣ Create the organizations_mv table
    await queryRunner.query(`
      CREATE TABLE organizations_mv (
        organization_id UUID PRIMARY KEY,
        name VARCHAR,
        external_id VARCHAR,
        total_coupons NUMERIC DEFAULT 0,
        total_campaigns NUMERIC DEFAULT 0,
        total_coupon_codes NUMERIC DEFAULT 0,
        total_members NUMERIC DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 2️⃣ Indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orgs_mv_name ON organizations_mv (name);
      CREATE INDEX IF NOT EXISTS idx_orgs_mv_total_coupons ON organizations_mv (total_coupons);
      CREATE INDEX IF NOT EXISTS idx_orgs_mv_total_campaigns ON organizations_mv (total_campaigns);
    `);

    // 3️⃣ Function to update/refresh organizations_mv
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_organizations_mv()
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO organizations_mv (
          organization_id,
          name,
          external_id,
          total_coupons,
          total_campaigns,
          total_coupon_codes,
          total_members,
          created_at,
          updated_at
        )
        WITH total_coupons AS (
          SELECT COUNT(coupon_id) AS total_coupons, organization_id
          FROM coupon
          WHERE status != 'archive'
          GROUP BY organization_id
        ),
        total_members AS (
          SELECT COUNT(user_id) AS total_members, organization_id
          FROM organization_user
          WHERE role != 'super_admin'
          GROUP BY organization_id
        ),
        total_campaigns AS (
          SELECT COUNT(campaign_id) AS total_campaigns, organization_id
          FROM campaign
          WHERE status != 'archive'
          GROUP BY organization_id
        ),
        total_coupon_codes AS (
          SELECT COUNT(coupon_code_id) AS total_coupon_codes, organization_id
          FROM coupon_code
          WHERE status != 'archive'
          GROUP BY organization_id
        )
        SELECT 
          o.organization_id, 
          o.name,
          o.external_id,
          COALESCE(c.total_coupons, 0),
          COALESCE(camp.total_campaigns, 0),
          COALESCE(cc.total_coupon_codes, 0),
          COALESCE(ou.total_members, 0),
          o.created_at,
          now()
        FROM organization o
        LEFT JOIN total_coupons c ON c.organization_id = o.organization_id
        LEFT JOIN total_members ou ON ou.organization_id = o.organization_id
        LEFT JOIN total_campaigns camp ON camp.organization_id = o.organization_id
        LEFT JOIN total_coupon_codes cc ON cc.organization_id = o.organization_id
        ON CONFLICT (organization_id)
        DO UPDATE SET
          name = EXCLUDED.name,
          external_id = EXCLUDED.external_id,
          total_coupons = EXCLUDED.total_coupons,
          total_campaigns = EXCLUDED.total_campaigns,
          total_coupon_codes = EXCLUDED.total_coupon_codes,
          total_members = EXCLUDED.total_members,
          updated_at = now();
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4️⃣ Trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_organizations_mv_update()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM update_organizations_mv();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 5️⃣ Triggers on related tables
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_orgs_mv_on_organization
        AFTER INSERT OR UPDATE OR DELETE ON organization
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_organizations_mv_update();

      CREATE TRIGGER trigger_update_orgs_mv_on_coupon
        AFTER INSERT OR UPDATE OR DELETE ON coupon
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_organizations_mv_update();

      CREATE TRIGGER trigger_update_orgs_mv_on_campaign
        AFTER INSERT OR UPDATE OR DELETE ON campaign
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_organizations_mv_update();

      CREATE TRIGGER trigger_update_orgs_mv_on_coupon_code
        AFTER INSERT OR UPDATE OR DELETE ON coupon_code
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_organizations_mv_update();

      CREATE TRIGGER trigger_update_orgs_mv_on_org_user
        AFTER INSERT OR UPDATE OR DELETE ON organization_user
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_organizations_mv_update();
    `);

    // 6️⃣ Initialize once
    // await queryRunner.query(`SELECT update_organizations_mv();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_orgs_mv_on_organization ON organization;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_orgs_mv_on_coupon ON coupon;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_orgs_mv_on_campaign ON campaign;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_orgs_mv_on_coupon_code ON coupon_code;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_orgs_mv_on_org_user ON organization_user;`);

    // Drop trigger function
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_organizations_mv_update();`);

    // Drop update function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_organizations_mv();`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orgs_mv_name;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orgs_mv_total_coupons;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orgs_mv_total_campaigns;`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS organizations_mv;`);
  }
}
