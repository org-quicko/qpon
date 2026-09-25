import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { User } from '../../src/entities/user.entity';
import { roleEnum } from '../../src/enums';

/**
 * The three @Public routes: first-run super-admin creation, the existence
 * probe `main.ts` uses on boot, and login. These are the only endpoints
 * reachable without credentials, so what they accept matters.
 */
describe('login and bootstrap (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp({ http: true });
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  const superAdminBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.user',
    name: 'Root',
    email: 'root@example.com',
    password: 'correct-horse',
    role: roleEnum.SUPER_ADMIN,
    ...overrides,
  });

  describe('GET /super-admin/exists', () => {
    it('reports false before any super admin is created', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/super-admin/exists')
        .expect(200);

      expect(response.body.data).toMatchObject({ exists: false });
    });

    it('reports true once one exists', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/super-admin/exists')
        .expect(200);

      expect(response.body.data).toMatchObject({ exists: true });
    });
  });

  describe('POST /users (first-run super admin)', () => {
    it('creates the super admin without credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      const stored = await dataSource
        .getRepository(User)
        .findOneByOrFail({ email: 'root@example.com' });
      expect(stored.role).toBe(roleEnum.SUPER_ADMIN);
    });

    it('stores the password hashed, never in the clear', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      const stored = await dataSource
        .getRepository(User)
        .findOneByOrFail({ email: 'root@example.com' });
      expect(stored.password).not.toBe('correct-horse');
      expect(stored.password.startsWith('$2')).toBe(true);
    });

    it('409s on a second super admin', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody({ email: 'second@example.com' }))
        .expect(409);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody({ isAdmin: true }))
        .expect(400);
    });
  });

  describe('POST /users/login', () => {
    it('returns an access token for correct credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'root@example.com', password: 'correct-horse' })
        .expect(201);

      expect(typeof response.body.data.access_token).toBe('string');
    });

    it('issues a token that is accepted by the guarded routes', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      const login = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'root@example.com', password: 'correct-horse' })
        .expect(201);

      await request(app.getHttpServer())
        .get('/api/organizations')
        .set('Authorization', `Bearer ${login.body.data.access_token}`)
        .expect(200);
    });

    it('401s on a wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'root@example.com', password: 'wrong' })
        .expect(401);
    });

    it('401s for an unknown email', async () => {
      await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'nobody@example.com', password: 'whatever' })
        .expect(401);
    });

    it('does not reveal whether the email exists', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send(superAdminBody())
        .expect(201);

      const wrongPassword = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'root@example.com', password: 'wrong' });

      const unknownEmail = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'nobody@example.com', password: 'wrong' });

      expect(wrongPassword.status).toBe(unknownEmail.status);
      expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    });
  });
});
