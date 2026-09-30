import { MigrationInterface, QueryRunner } from "typeorm";
import { getMigrationSchema } from "../migration-utils";

export class AddRedemptionDateToRedemption1750000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = getMigrationSchema(queryRunner);

        // Add column without default (to keep old rows NULL initially)
        await queryRunner.query(`
            ALTER TABLE "${schema}"."redemption"
            ADD COLUMN "redemption_date" DATE;
        `);

        await queryRunner.query(`
            UPDATE "${schema}"."redemption"
            SET "redemption_date" = DATE("created_at")
            WHERE "redemption_date" IS NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "${schema}"."redemption"
            ALTER COLUMN "redemption_date"
            SET DEFAULT CURRENT_DATE;
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_redemption_date"
            ON "${schema}"."redemption" ("redemption_date");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = getMigrationSchema(queryRunner);
        // Drop index first
        await queryRunner.query(`
            DROP INDEX "${schema}"."idx_redemption_date";
        `);

        // Drop column
        await queryRunner.query(`
            ALTER TABLE "${schema}"."redemption"
            DROP COLUMN "redemption_date";
        `);
    }
}
