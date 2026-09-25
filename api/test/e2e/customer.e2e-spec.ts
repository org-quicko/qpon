import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp, seedSuperAdmin } from '../support/test-app';
import { useIsolatedTransaction } from '../support/transaction';
import { bearer, createUserWithRole } from '../support/auth';
import {
  createCustomer,
  createCustomerCouponCode,
  createOrganization,
  createRedeemableSetup,
} from '../support/factories';
import { Customer } from '../../src/entities/customer.entity';
import { CustomerCouponCode } from '../../src/entities/customer-coupon-code.entity';
import { Organization } from '../../src/entities/organization.entity';
import { roleEnum, statusEnum } from '../../src/enums';

const MISSING_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

describe('customers (e2e)', () => {
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
  let auth: [string, string];

  beforeEach(async () => {
    await seedSuperAdmin(dataSource);
    organization = await createOrganization(dataSource);
    const admin = await createUserWithRole(dataSource, {
      role: roleEnum.ADMIN,
      organization,
    });
    auth = bearer(app, admin);
  });

  const customersUrl = () =>
    `/api/organizations/${organization.organizationId}/customers`;

  const validBody = (overrides: Record<string, unknown> = {}) => ({
    '@entity': 'org.quicko.qpon.customer',
    name: 'Asha',
    email: 'asha@example.com',
    external_id: 'cust-asha',
    ...overrides,
  });

  describe('POST /customers', () => {
    it('creates the customer against the organization in the path', async () => {
      const response = await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);

      const stored = await dataSource.getRepository(Customer).findOne({
        where: { customerId: response.body.data.customer_id },
        relations: { organization: true },
      });
      expect(stored?.organization.organizationId).toBe(
        organization.organizationId,
      );
      expect(stored?.status).toBe(statusEnum.ACTIVE);
    });

    it('409s on a duplicate email within the organization', async () => {
      await createCustomer(dataSource, organization, {
        email: 'asha@example.com',
      });

      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send(validBody())
        .expect(409);
    });

    it('allows the same email in a different organization', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createCustomer(dataSource, otherOrg, {
        email: 'asha@example.com',
      });

      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send(validBody())
        .expect(201);
    });

    it('accepts optional phone details', async () => {
      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send(validBody({ isd_code: '+91', phone: '9876543210' }))
        .expect(201);

      const stored = await dataSource
        .getRepository(Customer)
        .findOneByOrFail({ email: 'asha@example.com' });
      expect(stored.phone).toBe('9876543210');
      expect(stored.isdCode).toBe('+91');
    });

    it('rejects a body missing the email', async () => {
      const payload = validBody();
      delete (payload as Record<string, unknown>).email;

      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send(payload)
        .expect(400);
    });

    it('rejects a body with an undeclared property', async () => {
      await request(app.getHttpServer())
        .post(customersUrl())
        .set(...auth)
        .send(validBody({ vip: true }))
        .expect(400);
    });
  });

  describe('PUT /customers/upsert', () => {
    it('creates when the customer is new', async () => {
      await request(app.getHttpServer())
        .put(`${customersUrl()}/upsert`)
        .set(...auth)
        .send(validBody({ email: 'new@example.com', external_id: 'cust-new' }))
        .expect(200);

      expect(
        await dataSource
          .getRepository(Customer)
          .countBy({ email: 'new@example.com' }),
      ).toBe(1);
    });

    it('updates in place rather than duplicating', async () => {
      await createCustomer(dataSource, organization, {
        name: 'Old name',
        email: 'stable@example.com',
        externalId: 'cust-stable',
      });

      await request(app.getHttpServer())
        .put(`${customersUrl()}/upsert`)
        .set(...auth)
        .send(
          validBody({
            name: 'New name',
            email: 'stable@example.com',
            external_id: 'cust-stable',
          }),
        )
        .expect(200);

      const rows = await dataSource
        .getRepository(Customer)
        .findBy({ email: 'stable@example.com' });
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('New name');
    });
  });

  describe('GET /customers', () => {
    it('returns only customers of the organization in the path', async () => {
      const otherOrg = await createOrganization(dataSource);
      await createCustomer(dataSource, organization, { name: 'Mine' });
      await createCustomer(dataSource, otherOrg, { name: 'Theirs' });

      const response = await request(app.getHttpServer())
        .get(customersUrl())
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Mine');
      expect(body).not.toContain('Theirs');
    });

    it('filters by email, partially and case-insensitively', async () => {
      await createCustomer(dataSource, organization, {
        email: 'findme@example.com',
      });
      await createCustomer(dataSource, organization, {
        email: 'other@example.com',
      });

      const response = await request(app.getHttpServer())
        .get(customersUrl())
        .query({ email: 'FINDME' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('findme@example.com');
      expect(body).not.toContain('other@example.com');
    });

    it('filters by external id', async () => {
      await createCustomer(dataSource, organization, {
        name: 'Targeted',
        externalId: 'cust-target',
      });
      await createCustomer(dataSource, organization, { name: 'Untargeted' });

      const response = await request(app.getHttpServer())
        .get(customersUrl())
        .query({ external_id: 'cust-target' })
        .set(...auth)
        .expect(200);

      const body = JSON.stringify(response.body.data);
      expect(body).toContain('Targeted');
      expect(body).not.toContain('Untargeted');
    });

    it('excludes deleted customers', async () => {
      await createCustomer(dataSource, organization, {
        name: 'Removed',
        status: statusEnum.INACTIVE,
      });

      const response = await request(app.getHttpServer())
        .get(customersUrl())
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).not.toContain('Removed');
    });
  });

  describe('GET /customers/:customer_id', () => {
    it('returns the customer', async () => {
      const customer = await createCustomer(dataSource, organization, {
        name: 'Fetch me',
      });

      const response = await request(app.getHttpServer())
        .get(`${customersUrl()}/${customer.customerId}`)
        .set(...auth)
        .expect(200);

      expect(JSON.stringify(response.body.data)).toContain('Fetch me');
    });

    it('404s for an unknown customer', async () => {
      await request(app.getHttpServer())
        .get(`${customersUrl()}/${MISSING_ID}`)
        .set(...auth)
        .expect(404);
    });
  });

  describe('PATCH /customers/:customer_id', () => {
    it('updates the name', async () => {
      const customer = await createCustomer(dataSource, organization, {
        name: 'Before',
      });

      await request(app.getHttpServer())
        .patch(`${customersUrl()}/${customer.customerId}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.customer', name: 'After' })
        .expect(200);

      const stored = await dataSource
        .getRepository(Customer)
        .findOneByOrFail({ customerId: customer.customerId });
      expect(stored.name).toBe('After');
    });

    it('404s for an unknown customer', async () => {
      await request(app.getHttpServer())
        .patch(`${customersUrl()}/${MISSING_ID}`)
        .set(...auth)
        .send({ '@entity': 'org.quicko.qpon.customer', name: 'Anything' })
        .expect(404);
    });
  });

  describe('DELETE /customers/:customer_id', () => {
    it('deactivates the customer and drops their coupon-code links', async () => {
      const setup = await createRedeemableSetup(dataSource, organization);
      await createCustomerCouponCode(
        dataSource,
        setup.customer,
        setup.couponCode,
      );

      await request(app.getHttpServer())
        .delete(`${customersUrl()}/${setup.customer.customerId}`)
        .set(...auth)
        .expect(200);

      const stored = await dataSource
        .getRepository(Customer)
        .findOneByOrFail({ customerId: setup.customer.customerId });
      expect(stored.status).toBe(statusEnum.INACTIVE);

      expect(
        await dataSource
          .getRepository(CustomerCouponCode)
          .countBy({ customerId: setup.customer.customerId }),
      ).toBe(0);
    });

    it('404s on a second delete', async () => {
      const customer = await createCustomer(dataSource, organization);

      await request(app.getHttpServer())
        .delete(`${customersUrl()}/${customer.customerId}`)
        .set(...auth)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`${customersUrl()}/${customer.customerId}`)
        .set(...auth)
        .expect(404);
    });
  });
});
