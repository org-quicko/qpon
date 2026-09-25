import { MigrationInterface, QueryRunner } from "typeorm";
import { getMigrationSchema } from "../migration-utils";

/**
 * The entities declare `onDelete: 'CASCADE'` for these foreign keys, but the
 * initial migration created them as NO ACTION — so deleting an organization
 * that had any items, coupons, coupon codes, redemptions or an API key failed
 * with a foreign-key violation.
 *
 * The two join tables are included because they have no organization_id of
 * their own: once the organization's coupons, items, customers and coupon
 * codes are cascaded away, their coupon_item / customer_coupon_code rows
 * would still block the delete.
 */
const FOREIGN_KEYS = [
    { name: "FK_f8bf75c998e043dc6ad022d28a8", table: "api_key", column: "organization_id", references: "organization" },
    { name: "FK_67e3f26087d0b6806693359b472", table: "coupon", column: "organization_id", references: "organization" },
    { name: "FK_bfb03c3c8687dd43563fbb6fe8e", table: "coupon_code", column: "organization_id", references: "organization" },
    { name: "FK_6ab61f253f614fa35ce352f4b8e", table: "item", column: "organization_id", references: "organization" },
    { name: "FK_f7f0ec833201b06933a53eba6ae", table: "redemption", column: "organization_id", references: "organization" },
    { name: "FK_92ff11ded1ab958a520ae12336e", table: "coupon_item", column: "coupon_id", references: "coupon" },
    { name: "FK_a429563725c62dbf44cca4e3b04", table: "coupon_item", column: "item_id", references: "item" },
    { name: "FK_e7c5c65f38a0bc60c28305bad26", table: "customer_coupon_code", column: "coupon_code_id", references: "coupon_code" },
    { name: "FK_3e3017d0d142b8a0dae005fa955", table: "customer_coupon_code", column: "customer_id", references: "customer" },
];

export class CascadeOrganizationDeletes1790340633057 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.setOnDelete(queryRunner, "CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.setOnDelete(queryRunner, "NO ACTION");
    }

    private async setOnDelete(queryRunner: QueryRunner, rule: "CASCADE" | "NO ACTION"): Promise<void> {
        const schema = getMigrationSchema(queryRunner);

        for (const fk of FOREIGN_KEYS) {
            await queryRunner.query(`
                ALTER TABLE "${schema}"."${fk.table}"
                DROP CONSTRAINT "${fk.name}";
            `);

            await queryRunner.query(`
                ALTER TABLE "${schema}"."${fk.table}"
                ADD CONSTRAINT "${fk.name}" FOREIGN KEY ("${fk.column}")
                REFERENCES "${schema}"."${fk.references}"("${fk.column}")
                ON DELETE ${rule} ON UPDATE NO ACTION;
            `);
        }
    }
}
