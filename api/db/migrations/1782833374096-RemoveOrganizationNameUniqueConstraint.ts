import { MigrationInterface, QueryRunner } from "typeorm";
import { getMigrationSchema } from "../migration-utils";

export class RemoveOrganizationNameUniqueConstraint1782833374096 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise < void> {
        const schema = getMigrationSchema(queryRunner);
        await queryRunner.query(
            `ALTER TABLE "${schema}"."organization" DROP CONSTRAINT IF EXISTS "UQ_c21e615583a3ebbb0977452afb0"`,
        );
    }

public async down(queryRunner: QueryRunner): Promise < void> {
        const schema = getMigrationSchema(queryRunner);
        await queryRunner.query(
            `ALTER TABLE "${schema}"."organization" ADD CONSTRAINT "UQ_c21e615583a3ebbb0977452afb0" UNIQUE ("name")`,
        );
    }

}
