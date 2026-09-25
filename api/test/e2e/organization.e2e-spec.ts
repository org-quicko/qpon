import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import { createOrganization } from '../support/factories';
import { Organization } from '../../src/entities/organization.entity';
import { OrganizationUser } from '../../src/entities/organization-user.entity';
import { User } from '../../src/entities/user.entity';
import { roleEnum } from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('organizations (e2e)', () => {
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

  let superAdmin: User;
  let superAdminAuth: [string, string];

  beforeEach(async () => {
    superAdmin = await seedSuperAdmin(dataSource);
    superAdminAuth = bearer(app, superAdmin);
  });

  const validBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.organization',
    name: 'Acme Retail',
    currency: 'INR',
    ...overrides,
  });

  describe('POST /organizations', () => {
    it('creates the organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/organizations')
        .set(...superAdminAuth)
        .send(validBody())
        .expect(201);

      const stored = await dataSource
        .getRepository(Organization)
        .findOneByOrFail({
          organizationId: response.body.data.organization_id,
        });
      expect(stored.name).toBe('Acme Retail');
      expect(stored.currency).toBe('INR');
    });

    it('provisions the super admin as a member, via the entity subscriber', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/organizations')
        .set(...superAdminAuth)
        .send(validBody())
        .expect(201);

      const membership = await dataSource
        .getRepository(OrganizationUser)
        .findOneByOrFail({
          organizationId: response.body.data.organization_id,
        });
      expect(membership.userId).toBe(superAdmin.userId);
      expect(membership.role).toBe(roleEnum.SUPER_ADMIN);
    });

    it('allows two organizations to share a name', async () => {
      await createOrganization(dataSource, { name: 'Acme Retail' });

      await request(app.getHttpServer())
        .post('/api/organizations')
        .set(...superAdminAuth)
        .send(validBody())
        .expect(201);
    });

    it('rejects a body missing the currency', async () => {
      const payload = validBody();
      delete (payload as Record<string, unknown>).currency;

      await request(app.getHttpServer())
        .post('/api/organizations')
        .set(...superAdminAuth)
        .send(payload)
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations')
        .set(...superAdminAuth)
        .send(validBody({ tier: 'gold' }))
        .expect(400);
    });

    it('401s without credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations')
        .send(validBody())
        .expect(401);
    });
  });

  describe('GET /organizations/:organization_id', () => {
    it('returns the organization', async () => {
      const organization = await createOrganization(dataSource, {
        name: 'Readable',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/organizations/${organization.organizationId}`)
        .set(...superAdminAuth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain('Readable');
    });

    it('404s for an unknown organization', async () => {
      await request(app.getHttpServer())
        .get(`/api/organizations/${MISSING_ID}`)
        .set(...superAdminAuth)
        .expect(404);
    });
  });

  describe('PATCH /organizations/:organization_id', () => {
    it('updates the name', async () => {
      const organization = await createOrganization(dataSource, {
        name: 'Before',
      });

      await request(app.getHttpServer())
        .patch(`/api/organizations/${organization.organizationId}`)
        .set(...superAdminAuth)
        .send({ '@entity': 'org.quicko.qpon.organization', name: 'After' })
        .expect(200);

      const stored = await dataSource
        .getRepository(Organization)
        .findOneByOrFail({ organizationId: organization.organizationId });
      expect(stored.name).toBe('After');
    });

    it('is refused to an admin of a different organization', async () => {
      const mine = await createOrganization(dataSource);
      const theirs = await createOrganization(dataSource);
      const admin = await createUserWithRole(dataSource, {
        role: roleEnum.ADMIN,
        organization: mine,
      });

      await request(app.getHttpServer())
        .patch(`/api/organizations/${theirs.organizationId}`)
        .set(...bearer(app, admin))
        .send({ '@entity': 'org.quicko.qpon.organization', name: 'Hijacked' })
        .expect(403);
    });
  });

  describe('role-based access', () => {
    it('lets a member read their own organization', async () => {
      const organization = await createOrganization(dataSource);
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .get(`/api/organizations/${organization.organizationId}`)
        .set(...bearer(app, viewer))
        .expect(200);
    });

    it('refuses a viewer the ability to update it', async () => {
      const organization = await createOrganization(dataSource);
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .patch(`/api/organizations/${organization.organizationId}`)
        .set(...bearer(app, viewer))
        .send({ '@entity': 'org.quicko.qpon.organization', name: 'Nope' })
        .expect(403);
    });

    it('refuses a viewer the ability to delete it', async () => {
      const organization = await createOrganization(dataSource);
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .delete(`/api/organizations/${organization.organizationId}`)
        .set(...bearer(app, viewer))
        .expect(403);
    });
  });
});
