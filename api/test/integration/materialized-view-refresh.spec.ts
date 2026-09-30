import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../support/test-app';
import { MaterializedViewRefreshService } from '../../src/services/materialized-view-refresh.service';
import { LoggerService } from '../../src/services/logger.service';

/**
 * Confirms the known materialized-view list still refreshes cleanly against
 * the real schema TypeORM 1.x produced from the migrations.
 */
describe('MaterializedViewRefreshService', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refreshes all known materialized views without error', async () => {
    const service = app.get(MaterializedViewRefreshService);
    const logger = app.get(LoggerService);
    // refreshMaterializedViews() catches and logs per-view failures rather
    // than rethrowing them, so a clean resolve alone wouldn't catch a real
    // per-view regression — assert nothing was logged as failed instead.
    const errorSpy = vi.spyOn(logger, 'error');

    await service.refreshMaterializedViews();

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
