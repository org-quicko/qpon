import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRedemptionDateToRedemption1750000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        // Add column without default (to keep old rows NULL initially)
        await queryRunner.query(`
            ALTER TABLE "redemption"
            ADD COLUMN "redemption_date" DATE;
        `);

        await queryRunner.query(`
            UPDATE "redemption"
            SET "redemption_date" = DATE("created_at")
            WHERE "redemption_date" IS NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "redemption"
            ALTER COLUMN "redemption_date"
            SET DEFAULT CURRENT_DATE;
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_redemption_date"
            ON "redemption" ("redemption_date");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index first
        await queryRunner.query(`
            DROP INDEX "public"."idx_redemption_date";
        `);

        // Drop column
        await queryRunner.query(`
            ALTER TABLE "redemption"
            DROP COLUMN "redemption_date";
        `);
    }
}
