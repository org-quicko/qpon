import { QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export function getMigrationSchema(queryRunner: QueryRunner): string {
  const options = queryRunner.connection.options as PostgresConnectionOptions;
  return options.schema || 'public';
}
