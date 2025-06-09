import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOfferView1749102129900 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS offer`);
        await queryRunner.query(`
            CREATE VIEW offer 
            AS
            SELECT DISTINCT ON (cc.coupon_code_id)
                c.organization_id,
                c.coupon_id,
                camp.campaign_id,
                cc.coupon_code_id,
                cc.code,
                c.discount_type,
                c.discount_value,
                c.discount_upto,
                c.item_constraint,
                cc.customer_constraint,
                cc.minimum_amount,
                cc.max_redemption_per_customer,
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
            WHERE cc.status = 'active' AND  (cc.expires_at > now() OR cc.expires_at IS NULL);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS offer`);
    }

}
