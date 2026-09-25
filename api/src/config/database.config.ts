import type { DataSourceOptions } from "typeorm";

export type DatabaseConnectionOptions = Pick<
  Extract<DataSourceOptions, { type: "postgres" }>,
  'type' | 'url' | 'schema' | 'extra' | 'ssl' | 'invalidWhereValuesBehavior'
>;

interface DatabaseEnv {
  get(key: string): string | undefined;
}

export function buildDatabaseConnectionOptions(
  env: DatabaseEnv,
): DatabaseConnectionOptions {
  const schema = env.get('DB_SCHEMA') || undefined;
  const sslEnabled = env.get('DB_SSL') === 'true';

  return {
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    schema,
    // TypeORM 1.x throws by default when a `where` clause contains an
    // `undefined` value (0.3.x silently ignored it). Controllers build
    // optional filter objects with shorthand properties (e.g. `{ name }`)
    // that are `undefined`, not absent, when a query param isn't supplied —
    // restore the old behavior globally instead of auditing every call site.
    invalidWhereValuesBehavior: { undefined: 'ignore' },
    // TypeORM's `schema` option only qualifies table names it builds itself
    // (entity queries, the migrations table). Raw SQL in migration files uses
    // unqualified names, so the connection's search_path must also point at
    // the schema for those to land in the right place. `public` stays on the
    // path so unqualified extension functions (e.g. uuid_generate_v4()) still resolve.
    extra: schema ? { options: `-c search_path="${schema}",public` } : undefined,
    // Managed Postgres (RDS/Aurora, etc.) typically requires TLS. Node doesn't
    // trust Amazon's RDS CA out of the box, so verification is off by default;
    // set DB_SSL_REJECT_UNAUTHORIZED=true once a trusted CA is configured.
    ssl: sslEnabled
      ? { rejectUnauthorized: env.get('DB_SSL_REJECT_UNAUTHORIZED') === 'true' }
      : undefined,
  };
}
