import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRedemptionDateToRedemption1750000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE "redemption"
        ADD COLUMN "redemption_date" DATE DEFAULT CURRENT_DATE;;
    `);

        await queryRunner.query(`
        CREATE INDEX "IDX_redemption_date" ON "redemption" ("redemption_date");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP INDEX "public"."IDX_redemption_date";
    `);
        await queryRunner.query(`
        ALTER TABLE "redemption" DROP COLUMN "redemption_date";
    `);
    }

}