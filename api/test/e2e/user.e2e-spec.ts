import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import { createOrganization } from '../support/factories';
import { OrganizationUser } from '../../src/entities/organization-user.entity';
import { Organization } from '../../src/entities/organization.entity';
import { User } from '../../src/entities/user.entity';
import { roleEnum } from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('organization users (e2e)', () => {
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

  let organization: Organization;
  let superAdmin: User;
  let auth: [string, string];

  beforeEach(async () => {
    superAdmin = await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    auth = bearer(app, superAdmin);
  });

  const usersUrl = () =>
    `/api/organizations/${organization.organizationId}/users`;

  const inviteBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.user',
    name: 'Invited',
    email: 'invited@example.com',
    password: 'temp-password',
    role: roleEnum.EDITOR,
    ...overrides,
  });

  describe('POST /organizations/:organization_id/users', () => {
    it('creates the user and their membership with the requested role', async () => {
      await request(app.getHttpServer())
        .post(usersUrl())
        .set(...auth)
        .send(inviteBody())
        .expect(201);

      const user = await dataSource
        .getRepository(User)
        .findOneByOrFail({ email: 'invited@example.com' });

      const membership = await dataSource
        .getRepository(OrganizationUser)
        .findOneByOrFail({
          organizationId: organization.organizationId,
          userId: user.userId,
        });
      expect(membership.role).toBe(roleEnum.EDITOR);
    });

    it('hashes the invited user’s password', async () => {
      await request(app.getHttpServer())
        .post(usersUrl())
        .set(...auth)
        .send(inviteBody())
        .expect(201);

      const user = await dataSource
        .getRepository(User)
        .findOneByOrFail({ email: 'invited@example.com' });
      expect(user.password).not.toBe('temp-password');
    });

    it('adds a membership for an existing user instead of duplicating them', async () => {
      const otherOrg = await createOrganization(dataSource);
      const existing = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization: otherOrg,
        email: 'shared@example.com',
      });

      await request(app.getHttpServer())
        .post(usersUrl())
        .set(...auth)
        .send(inviteBody({ email: 'shared@example.com' }))
        .expect(201);

      expect(
        await dataSource
          .getRepository(User)
          .countBy({ email: 'shared@example.com' }),
      ).toBe(1);

      expect(
        await dataSource.getRepository(OrganizationUser).countBy({
          userId: existing.userId,
        }),
      ).toBe(2);
    });

    it('409s when the user is already a member of this organization', async () => {
      await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
        email: 'already@example.com',
      });

      await request(app.getHttpServer())
        .post(usersUrl())
        .set(...auth)
        .send(inviteBody({ email: 'already@example.com' }))
        .expect(409);
    });

    it('rejects an unknown role', async () => {
      await request(app.getHttpServer())
        .post(usersUrl())
        .set(...auth)
        .send(inviteBody({ role: 'overlord' }))
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(usersUrl())
        .set(...auth)
        .send(inviteBody({ superpowers: true }))
        .expect(400);
    });
  });

  describe('GET /organizations/:organization_id/users', () => {
    it('lists the members of the organization', async () => {
      await createUserWithRole(dataSource, {
        role: roleEnum.EDITOR,
        organization,
        email: 'member@example.com',
      });

      const response = await request(app.getHttpServer())
        .get(usersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain(
        'member@example.com',
      );
    });

    it('never includes password hashes in the payload', async () => {
      await createUserWithRole(dataSource, {
        role: roleEnum.EDITOR,
        organization,
        email: 'member@example.com',
      });

      const response = await request(app.getHttpServer())
        .get(usersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body)).not.toContain('$2b$');
      expect(JSON.stringify(response.body)).not.toContain('$2a$');
    });
  });

  describe('PATCH /organizations/:organization_id/users/:user_id/role', () => {
    it('changes the member’s role', async () => {
      const member = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .patch(`${usersUrl()}/${member.userId}/role`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.user', role: roleEnum.ADMIN })
        .expect(200);

      const membership = await dataSource
        .getRepository(OrganizationUser)
        .findOneByOrFail({
          organizationId: organization.organizationId,
          userId: member.userId,
        });
      expect(membership.role).toBe(roleEnum.ADMIN);
    });

    it('is refused to a viewer', async () => {
      const viewer = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });
      const target = await createUserWithRole(dataSource, {
        role: roleEnum.VIEWER,
        organization,
      });

      await request(app.getHttpServer())
        .patch(`${usersUrl()}/${target.userId}/role`)
        .set(...bearer(app, viewer))
        .send({ '@entity': 'org.quicko.qpon.user', role: roleEnum.ADMIN })
        .expect(403);
    });
  });

  describe('DELETE /organizations/:organization_id/users/:user_id', () => {
    it('removes the membership', async () => {
      const member = await createUserWithRole(dataSource, {
        role: roleEnum.EDITOR,
        organization,
      });

      await request(app.getHttpServer())
        .delete(`${usersUrl()}/${member.userId}`)
        .set(...auth)
        .expect(200);

      expect(
        await dataSource.getRepository(OrganizationUser).countBy({
          organizationId: organization.organizationId,
          userId: member.userId,
        }),
      ).toBe(0);
    });
  });

  describe('GET /users/:user_id', () => {
    it('returns the user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${superAdmin.userId}`)
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain(superAdmin.email);
    });

    // Regression guard for issue 3: fetchUser used to swallow its own
    // NotFoundException, resolving to undefined and reporting a 200 with no
    // `data` key for a user that does not exist.
    it('404s for an unknown user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${MISSING_ID}`)
        .set(...auth);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /users/:user_id/organizations', () => {
    it('lists the organizations the user belongs to', async () => {
      const member = await createUserWithRole(dataSource, {
        role: roleEnum.EDITOR,
        organization,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/users/${member.userId}/organizations`)
        .set(...bearer(app, member))
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain(
        organization.organizationId,
      );
    });
  });
});
