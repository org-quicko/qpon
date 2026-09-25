import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import * as entities from '../../src/entities';
import { InitialMigration1747285814143 } from '../../db/migrations/1747285814143-initial-migration';
import { UpdateOfferView1749102129900 } from '../../db/migrations/1749102129900-update-offer-view';
import { RefreshRedemptionSummaryMVs1750000000001 } from '../../db/migrations/1750000000001-RefreshRedemptionSummaryMV';
import { AddRedemptionDateToRedemption1750000000000 } from '../../db/migrations/1757000000000-AddRedemptionDateToRedemptionTable';
import { MVChanges1763469407282 } from '../../db/migrations/1763469407282-MVChanges';
import { RemoveOrganizationNameUniqueConstraint1782833374096 } from '../../db/migrations/1782833374096-RemoveOrganizationNameUniqueConstraint';

let container: StartedPostgreSqlContainer | undefined;

// TypeORM's file-glob migration loader does its own dynamic import() of the
// matched files at runtime, bypassing Vite's transform pipeline entirely —
// that hits Node's native ESM resolver, which can't resolve the extensionless
// relative imports migration files use (e.g. `from '../migration-utils'`).
// Importing the classes statically here lets Vite/esbuild transform them
// like any other test-graph module; TypeORM sorts by each migration's own
// embedded timestamp, so array order here doesn't matter.
const migrations = [
  InitialMigration1747285814143,
  UpdateOfferView1749102129900,
  RefreshRedemptionSummaryMVs1750000000001,
  AddRedemptionDateToRedemption1750000000000,
  MVChanges1763469407282,
  RemoveOrganizationNameUniqueConstraint1782833374096,
];

/**
 * Vitest globalSetup: starts one postgres:18 container for the whole
 * e2e/integration run, runs the real TypeORM migrations against it, and
 * exposes the connection via DATABASE_URL so the app under test (which reads
 * it through ConfigService) connects to the same database.
 */
export default async function setup() {
  container = await new PostgreSqlContainer('postgres:18').start();

  const databaseUrl = container.getConnectionUri();
  process.env.DATABASE_URL = databaseUrl;
  delete process.env.DB_SCHEMA;
  delete process.env.DB_SSL;

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: Object.values(entities),
    migrations,
  });

  await dataSource.initialize();

  // uuid_generate_v4() is used throughout the migrations as a column
  // default, but no migration creates the extension that provides it — the
  // real deployments apparently have it enabled out-of-band. Mirror that
  // here since we own this throwaway database.
  await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await dataSource.runMigrations();
  await dataSource.destroy();

  return async () => {
    await container?.stop();
  };
}
