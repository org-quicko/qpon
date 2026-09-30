import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationConverter } from '../converters/organization.converter';
import { LoggerService } from './logger.service';
import { Organization } from '../entities/organization.entity';
import { Coupon } from '../entities/coupon.entity';
import { statusEnum } from '../enums';

describe('OrganizationService.deleteOrganization', () => {
  let organizationRepository: {
    findOne: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    manager: { count: ReturnType<typeof vi.fn> };
  };
  let service: OrganizationService;

  // A fresh object per test, since remove() mutates it.
  const organization = () =>
    ({
      organizationId: 'org-1',
      name: 'Acme',
      currency: 'INR',
    }) as Organization;

  beforeEach(() => {
    organizationRepository = {
      findOne: vi.fn().mockResolvedValue(organization()),
      // Mirrors TypeORM, which clears the primary key on the removed entity.
      remove: vi.fn(async (entity: Organization) => {
        entity.organizationId = undefined as unknown as string;
        return entity;
      }),
      manager: { count: vi.fn().mockResolvedValue(0) },
    };
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
    const unused = {} as never;

    service = new OrganizationService(
      organizationRepository as unknown as Repository<Organization>,
      unused,
      unused,
      new OrganizationConverter(),
      unused,
      unused,
      unused,
      unused,
      unused,
      logger as unknown as LoggerService,
      unused,
      unused,
      unused,
    );
  });

  it('removes an organization without active coupons and returns it', async () => {
    const deleted = await service.deleteOrganization('org-1');

    expect(organizationRepository.manager.count).toHaveBeenCalledWith(Coupon, {
      where: {
        organization: { organizationId: 'org-1' },
        status: statusEnum.ACTIVE,
      },
    });
    expect(organizationRepository.remove).toHaveBeenCalledOnce();
    expect(deleted.organizationId).toBe('org-1');
  });

  it('refuses with 409 while the organization has active coupons', async () => {
    organizationRepository.manager.count.mockResolvedValue(2);

    const attempt = service.deleteOrganization('org-1');

    await expect(attempt).rejects.toBeInstanceOf(ConflictException);
    await expect(attempt).rejects.toThrow('2 active coupon(s)');
    expect(organizationRepository.remove).not.toHaveBeenCalled();
  });

  it('responds 404 for an unknown organization', async () => {
    organizationRepository.findOne.mockResolvedValue(null);

    await expect(service.deleteOrganization('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('reports unexpected failures as a 500', async () => {
    organizationRepository.remove.mockRejectedValue(
      new Error('connection lost'),
    );

    const attempt = service.deleteOrganization('org-1');

    await expect(attempt).rejects.toBeInstanceOf(HttpException);
    await expect(attempt).rejects.toMatchObject({ status: 500 });
  });
});
