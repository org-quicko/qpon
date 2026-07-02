import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrganizationNameUniqueConstraint1782833374096 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise < void> {
        await queryRunner.query(
            `ALTER TABLE "organization" DROP CONSTRAINT IF EXISTS "UQ_c21e615583a3ebbb0977452afb0"`,
        );
    }

public async down(queryRunner: QueryRunner): Promise < void> {
        await queryRunner.query(
            `ALTER TABLE "organization" ADD CONSTRAINT "UQ_c21e615583a3ebbb0977452afb0" UNIQUE ("name")`,
        );
    }

}
