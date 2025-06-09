import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1747285814143 implements MigrationInterface {
    name = 'InitialMigration1747285814143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "coupon_item" ("coupon_id" uuid NOT NULL, "item_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8fef03ad0f2265f3cc63dda0770" PRIMARY KEY ("coupon_id", "item_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."item_status_enum" AS ENUM('active', 'inactive', 'archive')`);
        await queryRunner.query(`CREATE TABLE "item" ("item_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "custom_fields" jsonb, "external_id" character varying, "status" "public"."item_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" uuid, CONSTRAINT "PK_8b21aa99996acd87a00c0ce553a" PRIMARY KEY ("item_id"))`);
        await queryRunner.query(`CREATE TABLE "redemption" ("redemption_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "base_order_value" numeric NOT NULL, "discount" numeric NOT NULL, "external_id" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "coupon_code_id" uuid, "campaign_id" uuid, "coupon_id" uuid, "customer_id" uuid, "item_id" uuid, "organization_id" uuid, CONSTRAINT "PK_3de77e1a56f3598773f5cc1c3b6" PRIMARY KEY ("redemption_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."customer_status_enum" AS ENUM('active', 'inactive', 'archive')`);
        await queryRunner.query(`CREATE TABLE "customer" ("customer_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "isd_code" character varying, "phone" character varying, "external_id" character varying, "status" "public"."customer_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" uuid, CONSTRAINT "PK_cde3d123fc6077bcd75eb051226" PRIMARY KEY ("customer_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fdb2f3ad8115da4c7718109a6e" ON "customer" ("email") `);
        await queryRunner.query(`CREATE TABLE "customer_coupon_code" ("customer_id" uuid NOT NULL, "coupon_code_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cea3ee232b8475eba13d705d438" PRIMARY KEY ("customer_id", "coupon_code_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_code_customer_constraint_enum" AS ENUM('all', 'specific')`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_code_visibility_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_code_duration_type_enum" AS ENUM('limited', 'forever')`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_code_status_enum" AS ENUM('active', 'inactive', 'expired', 'redeemed', 'archive')`);
        await queryRunner.query(`CREATE TABLE "coupon_code" ("coupon_code_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "description" character varying, "customer_constraint" "public"."coupon_code_customer_constraint_enum" NOT NULL, "max_redemptions" integer, "minimum_amount" numeric, "max_redemption_per_customer" integer, "visibility" "public"."coupon_code_visibility_enum" NOT NULL DEFAULT 'public', "duration_type" "public"."coupon_code_duration_type_enum" NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE, "redemption_count" integer NOT NULL DEFAULT '0', "status" "public"."coupon_code_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "campaign_id" uuid, "coupon_id" uuid, "organization_id" uuid, CONSTRAINT "PK_0ba40f760a52fb4dda395556ccd" PRIMARY KEY ("coupon_code_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."campaign_status_enum" AS ENUM('active', 'inactive', 'exhausted', 'archive')`);
        await queryRunner.query(`CREATE TABLE "campaign" ("campaign_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "budget" numeric, "external_id" character varying, "status" "public"."campaign_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "coupon_id" uuid, "organization_id" uuid, CONSTRAINT "PK_aa671c3359d0359082a84ecb801" PRIMARY KEY ("campaign_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_item_constraint_enum" AS ENUM('all', 'specific')`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_discount_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_status_enum" AS ENUM('active', 'inactive', 'archive')`);
        await queryRunner.query(`CREATE TABLE "coupon" ("coupon_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "item_constraint" "public"."coupon_item_constraint_enum" NOT NULL DEFAULT 'all', "discount_type" "public"."coupon_discount_type_enum" NOT NULL, "discount_value" numeric NOT NULL, "discount_upto" numeric, "status" "public"."coupon_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" uuid, CONSTRAINT "PK_188be7cee87815a2db1a014d003" PRIMARY KEY ("coupon_id"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("organization_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "currency" character varying NOT NULL, "external_id" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c21e615583a3ebbb0977452afb0" UNIQUE ("name"), CONSTRAINT "PK_ed1251fa3856cd1a6c98d7bcaa3" PRIMARY KEY ("organization_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_user_role_enum" AS ENUM('super_admin', 'admin', 'editor', 'viewer', 'regular')`);
        await queryRunner.query(`CREATE TABLE "organization_user" ("organization_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" "public"."organization_user_role_enum", "last_accessed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_902dc005457d79e570677b8a098" PRIMARY KEY ("organization_id", "user_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('super_admin', 'admin', 'editor', 'viewer', 'regular')`);
        await queryRunner.query(`CREATE TABLE "user" ("user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'regular', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "api_key" ("api_key_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "secret" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" uuid, CONSTRAINT "REL_f8bf75c998e043dc6ad022d28a" UNIQUE ("organization_id"), CONSTRAINT "PK_febd1522b7c552bbe6987e7b51f" PRIMARY KEY ("api_key_id"))`);
        await queryRunner.query(`ALTER TABLE "coupon_item" ADD CONSTRAINT "FK_a429563725c62dbf44cca4e3b04" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon_item" ADD CONSTRAINT "FK_92ff11ded1ab958a520ae12336e" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("coupon_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_6ab61f253f614fa35ce352f4b8e" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redemption" ADD CONSTRAINT "FK_88415d21940d19b537d83ba3ba4" FOREIGN KEY ("coupon_code_id") REFERENCES "coupon_code"("coupon_code_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redemption" ADD CONSTRAINT "FK_3177082a7f89b75460f1453dfe1" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("campaign_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redemption" ADD CONSTRAINT "FK_b95a97e7f769eae9fbc7ef9b69c" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("coupon_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redemption" ADD CONSTRAINT "FK_b575194c7b7abb2e1a9ae6d5d4d" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redemption" ADD CONSTRAINT "FK_488d4bd40338f182dd77b5c28ee" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redemption" ADD CONSTRAINT "FK_f7f0ec833201b06933a53eba6ae" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_f59a476121c4fe9ea136699a95d" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_coupon_code" ADD CONSTRAINT "FK_3e3017d0d142b8a0dae005fa955" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_coupon_code" ADD CONSTRAINT "FK_e7c5c65f38a0bc60c28305bad26" FOREIGN KEY ("coupon_code_id") REFERENCES "coupon_code"("coupon_code_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon_code" ADD CONSTRAINT "FK_dd6a597d0b8fc6e7d9d90d6003f" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("campaign_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon_code" ADD CONSTRAINT "FK_9cb005e1571c745dc66c68ac001" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("coupon_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon_code" ADD CONSTRAINT "FK_bfb03c3c8687dd43563fbb6fe8e" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign" ADD CONSTRAINT "FK_0336bc9a74d2d8329601dc281c3" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("coupon_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign" ADD CONSTRAINT "FK_8e2fbfe1fc6dc632c4631a1224b" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon" ADD CONSTRAINT "FK_67e3f26087d0b6806693359b472" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_user" ADD CONSTRAINT "FK_e2aaa5ea0d28c4e9196b107781e" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_user" ADD CONSTRAINT "FK_f29cfb2e32f6d58394bf0ce7e5c" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key" ADD CONSTRAINT "FK_f8bf75c998e043dc6ad022d28a8" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "organizations_mv" AS 
        with total_coupons as (
            select count(coupon_id) as total_coupons, organization_id
            from coupon
            where status != 'archive'
            group by organization_id
        ),
        total_members as (
            select count(user_id) as total_members, organization_id
            from organization_user
            where role != 'super_admin'
            group by organization_id
        ),
        total_campaigns as (
            select count(campaign_id) as total_campaigns, organization_id
            from campaign
            where status != 'archive'
            group by organization_id
        ),
        total_coupon_codes as (
            select count(coupon_code_id) as total_coupon_codes, organization_id
            from coupon_code
            where status != 'archive'
            group by organization_id
        )
        select 
            o.organization_id, 
            o.name,
            o.external_id, 
            coalesce(c.total_coupons, 0) as total_coupons,
            coalesce(camp.total_campaigns, 0) as total_campaigns,
            coalesce(cc.total_coupon_codes, 0) as total_coupon_codes,
            coalesce(ou.total_members, 0) as total_members,
            o.created_at
        from organization o
        left join total_coupons c on c.organization_id = o.organization_id
        left join total_members ou on ou.organization_id = o.organization_id
        left join total_campaigns camp on camp.organization_id = o.organization_id
        left join total_coupon_codes cc on cc.organization_id = o.organization_id;
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","organizations_mv","with total_coupons as (\n            select count(coupon_id) as total_coupons, organization_id\n            from coupon\n            where status != 'archive'\n            group by organization_id\n        ),\n        total_members as (\n            select count(user_id) as total_members, organization_id\n            from organization_user\n            where role != 'super_admin'\n            group by organization_id\n        ),\n        total_campaigns as (\n            select count(campaign_id) as total_campaigns, organization_id\n            from campaign\n            where status != 'archive'\n            group by organization_id\n        ),\n        total_coupon_codes as (\n            select count(coupon_code_id) as total_coupon_codes, organization_id\n            from coupon_code\n            where status != 'archive'\n            group by organization_id\n        )\n        select \n            o.organization_id, \n            o.name,\n            o.external_id, \n            coalesce(c.total_coupons, 0) as total_coupons,\n            coalesce(camp.total_campaigns, 0) as total_campaigns,\n            coalesce(cc.total_coupon_codes, 0) as total_coupon_codes,\n            coalesce(ou.total_members, 0) as total_members,\n            o.created_at\n        from organization o\n        left join total_coupons c on c.organization_id = o.organization_id\n        left join total_members ou on ou.organization_id = o.organization_id\n        left join total_campaigns camp on camp.organization_id = o.organization_id\n        left join total_coupon_codes cc on cc.organization_id = o.organization_id;"]);
        await queryRunner.query(`CREATE VIEW "offer" AS 
      SELECT DISTINCT ON (cc.coupon_code_id)
          c.organization_id,
          c.coupon_id,
          camp.campaign_id,
          cc.code,
          c.discount_type,
          c.discount_value,
          c.discount_upto,
          c.item_constraint,
          cc.customer_constraint,
          cc.minimum_amount,
          cc.visibility,
          cc.expires_at,
          ct.item_id,
          t.external_id AS external_item_id,
          cust.external_id AS external_customer_id,
          ccc.customer_id,
          camp.external_id AS external_campaign_id,
          cc.status AS coupon_code_status,
          now() as created_at,
          clock_timestamp() as updated_at
      FROM coupon c
      LEFT JOIN campaign camp ON camp.coupon_id = c.coupon_id
      LEFT JOIN coupon_code cc ON c.coupon_id = cc.coupon_id
      LEFT JOIN coupon_item ct ON c.coupon_id = ct.coupon_id
      LEFT JOIN item t ON ct.item_id = t.item_id
      LEFT JOIN customer_coupon_code ccc ON ccc.coupon_code_id = cc.coupon_code_id
      LEFT JOIN customer cust ON cust.customer_id = ccc.customer_id
      WHERE cc.status = 'active';
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","offer","SELECT DISTINCT ON (cc.coupon_code_id)\n          c.organization_id,\n          c.coupon_id,\n          camp.campaign_id,\n          cc.code,\n          c.discount_type,\n          c.discount_value,\n          c.discount_upto,\n          c.item_constraint,\n          cc.customer_constraint,\n          cc.minimum_amount,\n          cc.visibility,\n          cc.expires_at,\n          ct.item_id,\n          t.external_id AS external_item_id,\n          cust.external_id AS external_customer_id,\n          ccc.customer_id,\n          camp.external_id AS external_campaign_id,\n          cc.status AS coupon_code_status,\n          now() as created_at,\n          clock_timestamp() as updated_at\n      FROM coupon c\n      LEFT JOIN campaign camp ON camp.coupon_id = c.coupon_id\n      LEFT JOIN coupon_code cc ON c.coupon_id = cc.coupon_id\n      LEFT JOIN coupon_item ct ON c.coupon_id = ct.coupon_id\n      LEFT JOIN item t ON ct.item_id = t.item_id\n      LEFT JOIN customer_coupon_code ccc ON ccc.coupon_code_id = cc.coupon_code_id\n      LEFT JOIN customer cust ON cust.customer_id = ccc.customer_id\n      WHERE cc.status = 'active';"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "organization_summary_mv" AS 
       SELECT 
        o.organization_id,
        COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
        COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
        COALESCE(c.active_coupon_count, 0) AS active_coupon_count,
        COALESCE(c.inactive_coupon_count, 0) AS inactive_coupon_count,
        COALESCE(ca.active_campaign_count, 0) AS active_campaign_count,
        COALESCE(ca.inactive_campaign_count, 0) AS inactive_campaign_count,
        COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
        now() AS created_at,
        clock_timestamp() AS updated_at
    FROM organization o
    -- Aggregate redemption data
    LEFT JOIN (
    SELECT 
        organization_id,
        COUNT(redemption_id) AS total_redemption_count,
        SUM(discount) AS total_redemption_amount
    FROM redemption
    GROUP BY organization_id
    ) r ON o.organization_id = r.organization_id
    -- Aggregate coupon data
    LEFT JOIN (
        SELECT 
            organization_id,
            COUNT(*) FILTER (WHERE status = 'active') AS active_coupon_count,
            COUNT(*) FILTER (WHERE status <> 'active') AS inactive_coupon_count
        FROM coupon
        GROUP BY organization_id
    ) c ON o.organization_id = c.organization_id
    -- Aggregate campaign data
    LEFT JOIN (
        SELECT 
            c.organization_id,
            COUNT(*) FILTER (WHERE ca.status = 'active') AS active_campaign_count,
            COUNT(*) FILTER (WHERE ca.status <> 'active') AS inactive_campaign_count
        FROM campaign ca
        JOIN coupon c ON ca.coupon_id = c.coupon_id
        GROUP BY c.organization_id
    ) ca ON o.organization_id = ca.organization_id
    -- Aggregate coupon code data
    LEFT JOIN (
        SELECT 
            c.organization_id,
            COUNT(*) FILTER (WHERE cc.status = 'active') AS active_coupon_code_count
        FROM coupon_code cc
        JOIN coupon c ON cc.coupon_id = c.coupon_id
        GROUP BY c.organization_id
    ) cc ON o.organization_id = cc.organization_id;
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","organization_summary_mv","SELECT \n        o.organization_id,\n        COALESCE(r.total_redemption_count, 0) AS total_redemption_count,\n        COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,\n        COALESCE(c.active_coupon_count, 0) AS active_coupon_count,\n        COALESCE(c.inactive_coupon_count, 0) AS inactive_coupon_count,\n        COALESCE(ca.active_campaign_count, 0) AS active_campaign_count,\n        COALESCE(ca.inactive_campaign_count, 0) AS inactive_campaign_count,\n        COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,\n        now() AS created_at,\n        clock_timestamp() AS updated_at\n    FROM organization o\n    -- Aggregate redemption data\n    LEFT JOIN (\n    SELECT \n        organization_id,\n        COUNT(redemption_id) AS total_redemption_count,\n        SUM(discount) AS total_redemption_amount\n    FROM redemption\n    GROUP BY organization_id\n    ) r ON o.organization_id = r.organization_id\n    -- Aggregate coupon data\n    LEFT JOIN (\n        SELECT \n            organization_id,\n            COUNT(*) FILTER (WHERE status = 'active') AS active_coupon_count,\n            COUNT(*) FILTER (WHERE status <> 'active') AS inactive_coupon_count\n        FROM coupon\n        GROUP BY organization_id\n    ) c ON o.organization_id = c.organization_id\n    -- Aggregate campaign data\n    LEFT JOIN (\n        SELECT \n            c.organization_id,\n            COUNT(*) FILTER (WHERE ca.status = 'active') AS active_campaign_count,\n            COUNT(*) FILTER (WHERE ca.status <> 'active') AS inactive_campaign_count\n        FROM campaign ca\n        JOIN coupon c ON ca.coupon_id = c.coupon_id\n        GROUP BY c.organization_id\n    ) ca ON o.organization_id = ca.organization_id\n    -- Aggregate coupon code data\n    LEFT JOIN (\n        SELECT \n            c.organization_id,\n            COUNT(*) FILTER (WHERE cc.status = 'active') AS active_coupon_code_count\n        FROM coupon_code cc\n        JOIN coupon c ON cc.coupon_id = c.coupon_id\n        GROUP BY c.organization_id\n    ) cc ON o.organization_id = cc.organization_id;"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "coupon_summary_mv" AS 
   SELECT
      c.organization_id,
      c.coupon_id,
      COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
      COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
      COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
      COALESCE(cc.redeemed_coupon_code_count, 0) AS redeemed_coupon_code_count,
      COALESCE(camp.active_campaign_count, 0) AS active_campaign_count,
      COALESCE(camp.total_campaign_count, 0) AS total_campaign_count,
      COALESCE(camp.budget, 0) AS budget,
      c.status,
      now() AS created_at,
      clock_timestamp() AS updated_at
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
    ) camp ON c.coupon_id = camp.coupon_id;
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","coupon_summary_mv","SELECT\n      c.organization_id,\n      c.coupon_id,\n      COALESCE(r.total_redemption_count, 0) AS total_redemption_count,\n      COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,\n      COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,\n      COALESCE(cc.redeemed_coupon_code_count, 0) AS redeemed_coupon_code_count,\n      COALESCE(camp.active_campaign_count, 0) AS active_campaign_count,\n      COALESCE(camp.total_campaign_count, 0) AS total_campaign_count,\n      COALESCE(camp.budget, 0) AS budget,\n      c.status,\n      now() AS created_at,\n      clock_timestamp() AS updated_at\n    FROM coupon c\n    LEFT JOIN (\n        SELECT \n            coupon_id,\n            COUNT(redemption_id) AS total_redemption_count,\n            SUM(discount) AS total_redemption_amount\n        FROM redemption\n        GROUP BY coupon_id\n    ) r ON c.coupon_id = r.coupon_id\n    LEFT JOIN (\n        SELECT \n            coupon_id,\n            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count,\n            SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) AS redeemed_coupon_code_count\n        FROM coupon_code\n        GROUP BY coupon_id\n    ) cc ON c.coupon_id = cc.coupon_id\n    LEFT JOIN (\n        SELECT \n            coupon_id,\n            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_campaign_count,\n            COUNT(campaign_id) AS total_campaign_count,\n            SUM(budget) AS budget\n        FROM campaign\n        GROUP BY coupon_id\n    ) camp ON c.coupon_id = camp.coupon_id;"]);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "campaign_summary_mv" AS 
     SELECT
      c.organization_id,
      cp.coupon_id,
      cp.campaign_id,
      cp.name,
      cp.budget,
      COALESCE(r.total_redemption_count, 0) AS total_redemption_count,
      COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,
      COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,
      cp.status,
      cp.created_at AS created_at,
      clock_timestamp() AS updated_at
    FROM campaign cp
    LEFT JOIN coupon c ON cp.coupon_id = c.coupon_id
    LEFT JOIN (
        -- Aggregate redemption counts per campaign
        SELECT 
            campaign_id,
            COUNT(redemption_id) AS total_redemption_count,
            SUM(discount) AS total_redemption_amount
        FROM redemption
        GROUP BY campaign_id
    ) r ON cp.campaign_id = r.campaign_id
    LEFT JOIN (
        -- Aggregate coupon code counts per campaign
        SELECT 
            campaign_id,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count
        FROM coupon_code
        GROUP BY campaign_id
    ) cc ON cp.campaign_id = cc.campaign_id;
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","campaign_summary_mv","SELECT\n      c.organization_id,\n      cp.coupon_id,\n      cp.campaign_id,\n      cp.name,\n      cp.budget,\n      COALESCE(r.total_redemption_count, 0) AS total_redemption_count,\n      COALESCE(r.total_redemption_amount, 0) AS total_redemption_amount,\n      COALESCE(cc.active_coupon_code_count, 0) AS active_coupon_code_count,\n      cp.status,\n      cp.created_at AS created_at,\n      clock_timestamp() AS updated_at\n    FROM campaign cp\n    LEFT JOIN coupon c ON cp.coupon_id = c.coupon_id\n    LEFT JOIN (\n        -- Aggregate redemption counts per campaign\n        SELECT \n            campaign_id,\n            COUNT(redemption_id) AS total_redemption_count,\n            SUM(discount) AS total_redemption_amount\n        FROM redemption\n        GROUP BY campaign_id\n    ) r ON cp.campaign_id = r.campaign_id\n    LEFT JOIN (\n        -- Aggregate coupon code counts per campaign\n        SELECT \n            campaign_id,\n            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_coupon_code_count\n        FROM coupon_code\n        GROUP BY campaign_id\n    ) cc ON cp.campaign_id = cc.campaign_id;"]);
        await queryRunner.query(`CREATE INDEX "IDX_70a7c93dcae43e579e28823e2f" ON "organizations_mv" ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_15ee80d9b662f26f48995ecf85" ON "coupon_summary_mv" ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_13f4bd626540ff798d7392e7ac" ON "coupon_summary_mv" ("coupon_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f4ef4d447dbbd53a4c15e83018" ON "campaign_summary_mv" ("coupon_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_baa09729af8624b04c38e37a89" ON "campaign_summary_mv" ("campaign_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_baa09729af8624b04c38e37a89"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4ef4d447dbbd53a4c15e83018"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13f4bd626540ff798d7392e7ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_15ee80d9b662f26f48995ecf85"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70a7c93dcae43e579e28823e2f"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","campaign_summary_mv","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "campaign_summary_mv"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","coupon_summary_mv","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "coupon_summary_mv"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","organization_summary_mv","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "organization_summary_mv"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","offer","public"]);
        await queryRunner.query(`DROP VIEW "offer"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","organizations_mv","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "organizations_mv"`);
        await queryRunner.query(`ALTER TABLE "api_key" DROP CONSTRAINT "FK_f8bf75c998e043dc6ad022d28a8"`);
        await queryRunner.query(`ALTER TABLE "organization_user" DROP CONSTRAINT "FK_f29cfb2e32f6d58394bf0ce7e5c"`);
        await queryRunner.query(`ALTER TABLE "organization_user" DROP CONSTRAINT "FK_e2aaa5ea0d28c4e9196b107781e"`);
        await queryRunner.query(`ALTER TABLE "coupon" DROP CONSTRAINT "FK_67e3f26087d0b6806693359b472"`);
        await queryRunner.query(`ALTER TABLE "campaign" DROP CONSTRAINT "FK_8e2fbfe1fc6dc632c4631a1224b"`);
        await queryRunner.query(`ALTER TABLE "campaign" DROP CONSTRAINT "FK_0336bc9a74d2d8329601dc281c3"`);
        await queryRunner.query(`ALTER TABLE "coupon_code" DROP CONSTRAINT "FK_bfb03c3c8687dd43563fbb6fe8e"`);
        await queryRunner.query(`ALTER TABLE "coupon_code" DROP CONSTRAINT "FK_9cb005e1571c745dc66c68ac001"`);
        await queryRunner.query(`ALTER TABLE "coupon_code" DROP CONSTRAINT "FK_dd6a597d0b8fc6e7d9d90d6003f"`);
        await queryRunner.query(`ALTER TABLE "customer_coupon_code" DROP CONSTRAINT "FK_e7c5c65f38a0bc60c28305bad26"`);
        await queryRunner.query(`ALTER TABLE "customer_coupon_code" DROP CONSTRAINT "FK_3e3017d0d142b8a0dae005fa955"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_f59a476121c4fe9ea136699a95d"`);
        await queryRunner.query(`ALTER TABLE "redemption" DROP CONSTRAINT "FK_f7f0ec833201b06933a53eba6ae"`);
        await queryRunner.query(`ALTER TABLE "redemption" DROP CONSTRAINT "FK_488d4bd40338f182dd77b5c28ee"`);
        await queryRunner.query(`ALTER TABLE "redemption" DROP CONSTRAINT "FK_b575194c7b7abb2e1a9ae6d5d4d"`);
        await queryRunner.query(`ALTER TABLE "redemption" DROP CONSTRAINT "FK_b95a97e7f769eae9fbc7ef9b69c"`);
        await queryRunner.query(`ALTER TABLE "redemption" DROP CONSTRAINT "FK_3177082a7f89b75460f1453dfe1"`);
        await queryRunner.query(`ALTER TABLE "redemption" DROP CONSTRAINT "FK_88415d21940d19b537d83ba3ba4"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_6ab61f253f614fa35ce352f4b8e"`);
        await queryRunner.query(`ALTER TABLE "coupon_item" DROP CONSTRAINT "FK_92ff11ded1ab958a520ae12336e"`);
        await queryRunner.query(`ALTER TABLE "coupon_item" DROP CONSTRAINT "FK_a429563725c62dbf44cca4e3b04"`);
        await queryRunner.query(`DROP TABLE "api_key"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "organization_user"`);
        await queryRunner.query(`DROP TYPE "public"."organization_user_role_enum"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "coupon"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_discount_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_item_constraint_enum"`);
        await queryRunner.query(`DROP TABLE "campaign"`);
        await queryRunner.query(`DROP TYPE "public"."campaign_status_enum"`);
        await queryRunner.query(`DROP TABLE "coupon_code"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_code_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_code_duration_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_code_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_code_customer_constraint_enum"`);
        await queryRunner.query(`DROP TABLE "customer_coupon_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdb2f3ad8115da4c7718109a6e"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TYPE "public"."customer_status_enum"`);
        await queryRunner.query(`DROP TABLE "redemption"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP TYPE "public"."item_status_enum"`);
        await queryRunner.query(`DROP TABLE "coupon_item"`);
    }

}
