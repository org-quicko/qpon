import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { AuthService } from '../../src/services/auth.service';
import { UserService } from '../../src/services/user.service';
import { createOrganization } from '../support/factories';
import { roleEnum } from '../../src/enums';

describe('AuthService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(AuthService);
    userService = app.get(UserService);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
  });

  describe('authenticate', () => {
    it('rejects an unknown email', async () => {
      await expect(
        service.authenticate({
          email: 'nobody@test.local',
          password: 'whatever',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects the wrong password for a known email', async () => {
      const organization = await createOrganization(dataSource);
      await userService.createUser(organization.organizationId, {
        entity: 'org.quicko.qpon.user',
        name: 'Real User',
        email: 'real@test.local',
        password: 'correct-password',
        role: roleEnum.EDITOR,
      } as never);

      await expect(
        service.authenticate({
          email: 'real@test.local',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns a valid signed JWT for the correct credentials', async () => {
      const organization = await createOrganization(dataSource);
      const created = await userService.createUser(
        organization.organizationId,
        {
          entity: 'org.quicko.qpon.user',
          name: 'Real User',
          email: 'real@test.local',
          password: 'correct-password',
          role: roleEnum.EDITOR,
        } as never,
      );

      const result = await service.authenticate({
        email: 'real@test.local',
        password: 'correct-password',
      });

      expect(result.access_token).toBeTruthy();
      const decoded = jwtService.verify(result.access_token);
      expect(decoded.sub).toBe(created.userId);
    });
  });
});
