import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CouponService } from './coupon.service';
import { LoggerService } from './logger.service';
import { Coupon } from '../entities/coupon.entity';
import { CouponSummaryMv } from '../entities/coupon-summary.view';
import { CouponConverter } from '../converters/coupon.converter';
import { CouponListConverter } from '../converters/coupon-list.converter';
import { CouponSummaryWorkbookConverter } from '../converters/coupon-summary';
import { CreateCouponDto } from '../dtos';
import { discountTypeEnum, itemConstraintEnum, statusEnum } from '../enums';

/**
 * Unit coverage for the branches of CouponService that do not need a
 * database: the guard clauses, and the error translation each catch block
 * performs. Anything that depends on real SQL semantics (the case-insensitive
 * name lookup, the archive cascades) is covered in
 * test/integration/coupon.service.spec.ts instead — mocking a repository
 * cannot prove a query is correct.
 */
describe('CouponService (unit)', () => {
  let service: CouponService;
  let couponRepository: {
    findOne: ReturnType<typeof vi.fn>;
    findAndCount: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let manager: {
    getRepository: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  // A plain object rather than a CreateCouponDto instance: the spec spreads
  // it to build variants, and spreading a class instance drops its prototype.
  const createDto = (
    overrides: Partial<Record<keyof CreateCouponDto, unknown>> = {},
  ): CreateCouponDto =>
    ({
      entity: 'org.quicko.qpon.coupon',
      name: 'Diwali 20',
      discountType: discountTypeEnum.PERCENTAGE,
      discountValue: 20,
      discountUpto: 100,
      itemConstraint: itemConstraintEnum.ALL,
      ...overrides,
    }) as CreateCouponDto;

  beforeEach(async () => {
    couponRepository = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
      update: vi.fn(),
      create: vi.fn((input) => input),
    };

    manager = {
      getRepository: vi.fn(() => couponRepository),
      save: vi.fn((entity) => entity),
      update: vi.fn(),
      delete: vi.fn(),
      findOne: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: couponRepository as unknown as Repository<Coupon>,
        },
        {
          provide: getRepositoryToken(CouponSummaryMv),
          useValue: { find: vi.fn().mockResolvedValue([]) },
        },
        { provide: CouponConverter, useValue: { convert: (c: unknown) => c } },
        {
          provide: CouponListConverter,
          useValue: { convert: (items: unknown) => items },
        },
        {
          provide: CouponSummaryWorkbookConverter,
          useValue: { convert: (items: unknown) => items },
        },
        {
          provide: LoggerService,
          useValue: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        },
        {
          provide: DataSource,
          useValue: {
            // Run the callback inline; these tests are about the logic inside
            // the transaction, not about transaction management itself.
            transaction: (cb: (m: EntityManager) => unknown) =>
              cb(manager as unknown as EntityManager),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(CouponService);
  });

  describe('createCoupon', () => {
    it('rejects a discount value of zero', async () => {
      await expect(
        service.createCoupon('org-1', createDto({ discountValue: 0 })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a negative discount value', async () => {
      await expect(
        service.createCoupon('org-1', createDto({ discountValue: -5 })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a name already used in the organization', async () => {
      couponRepository.findOne.mockResolvedValue({ couponId: 'existing' });

      await expect(
        service.createCoupon('org-1', createDto()),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('saves the coupon scoped to the organization it was given', async () => {
      couponRepository.findOne.mockResolvedValue(null);

      await service.createCoupon('org-1', createDto());

      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Diwali 20',
          organization: { organizationId: 'org-1' },
        }),
      );
    });

    it('translates an unexpected repository failure into a 500', async () => {
      couponRepository.findOne.mockRejectedValue(new Error('connection lost'));

      const error = await service
        .createCoupon('org-1', createDto())
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(500);
    });

    it('does not leak the underlying error message to the caller', async () => {
      couponRepository.findOne.mockRejectedValue(
        new Error('password authentication failed for user "qpon"'),
      );

      const error = await service
        .createCoupon('org-1', createDto())
        .catch((e) => e);

      expect((error as HttpException).message).toBe('Failed to create coupon');
    });
  });

  describe('fetchCoupons', () => {
    it('defaults to excluding archived coupons when no status filter is given', async () => {
      couponRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.fetchCoupons('org-1');

      const where = couponRepository.findAndCount.mock.calls[0][0].where;
      expect(where.status).toBeDefined();
    });

    it('keeps an explicit status filter instead of overriding it', async () => {
      couponRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.fetchCoupons('org-1', 0, 10, {
        status: statusEnum.INACTIVE,
      });

      const where = couponRepository.findAndCount.mock.calls[0][0].where;
      expect(where.status).toBe(statusEnum.INACTIVE);
    });

    it('scopes the query to the organization', async () => {
      couponRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.fetchCoupons('org-1');

      const where = couponRepository.findAndCount.mock.calls[0][0].where;
      expect(where.organization).toEqual({ organizationId: 'org-1' });
    });

    it('passes skip and take straight through', async () => {
      couponRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.fetchCoupons('org-1', 20, 5);

      expect(couponRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 5 }),
      );
    });

    it('only sets an order clause when a sort column is requested', async () => {
      couponRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.fetchCoupons('org-1');

      expect(
        couponRepository.findAndCount.mock.calls[0][0].order,
      ).toBeUndefined();
    });

    it('returns an empty list rather than throwing when nothing matches', async () => {
      couponRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(service.fetchCoupons('org-1')).resolves.toEqual([]);
    });
  });

  describe('fetchCoupon', () => {
    it('throws NotFound when the coupon is absent', async () => {
      couponRepository.findOne.mockResolvedValue(null);

      await expect(service.fetchCoupon('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns the converted coupon when present', async () => {
      couponRepository.findOne.mockResolvedValue({ couponId: 'c-1' });

      await expect(service.fetchCoupon('c-1')).resolves.toEqual({
        couponId: 'c-1',
      });
    });
  });

  describe('updateCoupon', () => {
    it('throws NotFound when the coupon is absent', async () => {
      couponRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCoupon('org-1', 'missing', {
          entity: 'org.quicko.qpon.coupon',
          name: 'New',
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('drops coupon items when the constraint narrows from specific to all', async () => {
      couponRepository.findOne
        .mockResolvedValueOnce({
          couponId: 'c-1',
          itemConstraint: itemConstraintEnum.SPECIFIC,
        })
        // the duplicate-name lookup
        .mockResolvedValueOnce(null);

      await service.updateCoupon('org-1', 'c-1', {
        entity: 'org.quicko.qpon.coupon',
        itemConstraint: itemConstraintEnum.ALL,
      } as never);

      expect(manager.delete).toHaveBeenCalled();
    });

    it('leaves coupon items alone when the constraint is unchanged', async () => {
      couponRepository.findOne.mockResolvedValueOnce({
        couponId: 'c-1',
        itemConstraint: itemConstraintEnum.ALL,
      });

      await service.updateCoupon('org-1', 'c-1', {
        entity: 'org.quicko.qpon.coupon',
        itemConstraint: itemConstraintEnum.ALL,
      } as never);

      expect(manager.delete).not.toHaveBeenCalled();
    });
  });

  describe('reactivateCoupon', () => {
    it('throws NotFound for an archived coupon', async () => {
      couponRepository.findOne.mockResolvedValue(null);

      await expect(service.reactivateCoupon('archived')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('sets the status back to active', async () => {
      couponRepository.findOne.mockResolvedValue({ couponId: 'c-1' });

      await service.reactivateCoupon('c-1');

      expect(couponRepository.update).toHaveBeenCalledWith('c-1', {
        status: statusEnum.ACTIVE,
      });
    });
  });
});
