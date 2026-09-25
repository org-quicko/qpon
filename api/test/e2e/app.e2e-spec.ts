import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../support/test-app';

/**
 * Smoke coverage for the wiring every other e2e spec sits on: the app boots
 * against the migrated container, the global prefix is applied, and the
 * @Public escape hatch bypasses the two global guards.
 */
describe('application bootstrap (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp({ http: true });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serves the root controller under the /api global prefix', async () => {
    await request(app.getHttpServer()).get('/api').expect(200);
  });

  it('does not serve controller routes off-prefix', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).not.toBe(200);
  });

  it('lets @Public routes through both global guards without credentials', async () => {
    const response = await request(app.getHttpServer()).get('/api');
    expect(response.status).toBe(200);
  });

  it('rejects an unauthenticated request to a guarded route', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/organizations',
    );
    expect(response.status).toBe(401);
  });
});
