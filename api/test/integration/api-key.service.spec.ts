import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { createOrganization } from '../support/factories';
import { ApiKeyService } from '../../src/services/api-key.service';
import { ApiKey } from '../../src/entities/api-key.entity';
import { Organization } from '../../src/entities/organization.entity';

describe('ApiKeyService (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let service: ApiKeyService;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
    service = app.get(ApiKeyService);
  });

  afterAll(async () => {
    await app?.close();
  });

  useIsolatedTransaction(() => dataSource);

  let organization: Organization;

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
  });

  describe('createApiKey', () => {
    it('stores the secret hashed rather than in plaintext', async () => {
      const created = await service.createApiKey(organization.organizationId);

      const stored = await dataSource
        .getRepository(ApiKey)
        .findOneByOrFail({
          organization: { organizationId: organization.organizationId },
        });
      expect(stored.secret).not.toBe((created as { secret: string }).secret);
    });

    it('replaces an existing key rather than keeping both', async () => {
      const first = await service.createApiKey(organization.organizationId);
      const second = await service.createApiKey(organization.organizationId);

      expect(
        await dataSource
          .getRepository(ApiKey)
          .countBy({
            organization: { organizationId: organization.organizationId },
          }),
      ).toBe(1);

      const stored = await dataSource
        .getRepository(ApiKey)
        .findOneByOrFail({
          organization: { organizationId: organization.organizationId },
        });
      expect(stored.key).not.toBe((first as { key: string }).key);
      expect(stored.key).toBe((second as { key: string }).key);
    });

    it('does not disturb another organization’s key', async () => {
      const otherOrg = await createOrganization(dataSource);
      const otherKey = await service.createApiKey(otherOrg.organizationId);

      await service.createApiKey(organization.organizationId);

      const stillThere = await dataSource
        .getRepository(ApiKey)
        .findOneByOrFail({
          organization: { organizationId: otherOrg.organizationId },
        });
      expect(stillThere.key).toBe((otherKey as { key: string }).key);
    });
  });

  describe('fetchApiKey', () => {
    it('returns null when the organization has no key', async () => {
      await expect(
        service.fetchApiKey(organization.organizationId),
      ).resolves.toBeNull();
    });

    it('returns the key for an organization that has one', async () => {
      const created = await service.createApiKey(organization.organizationId);

      const fetched = await service.fetchApiKey(organization.organizationId);

      expect((fetched as { key: string }).key).toBe(
        (created as { key: string }).key,
      );
    });
  });

  describe('validateKeyAndSecret', () => {
    it('returns null for an unknown key', async () => {
      await expect(
        service.validateKeyAndSecret('unknown-key', 'unknown-secret'),
      ).resolves.toBeNull();
    });

    it('returns null when the secret does not match', async () => {
      const created = await service.createApiKey(organization.organizationId);

      await expect(
        service.validateKeyAndSecret(
          (created as { key: string }).key,
          'wrong-secret',
        ),
      ).resolves.toBeNull();
    });

    it('returns the api key entity when key and secret match', async () => {
      const created = await service.createApiKey(organization.organizationId);

      const result = await service.validateKeyAndSecret(
        (created as { key: string }).key,
        (created as { secret: string }).secret,
      );

      expect(result?.organization.organizationId).toBe(
        organization.organizationId,
      );
    });
  });
});
