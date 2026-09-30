import { QueryRunner } from 'typeorm';
import type { DataSourceOptions } from "typeorm";

export function getMigrationSchema(queryRunner: QueryRunner): string {
  const options = queryRunner.dataSource.options as Extract<DataSourceOptions, { type: "postgres" }>;
  return options.schema || 'public';
}
