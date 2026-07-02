import { Customer } from '@org-quicko/qpon-core';
import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  const config = new QponCredentials("5e6921d401c4f8ed4adb6e17c8335d69", "571f98a459e41b78ba5896b514e3706ddcb93d424a1521edbd50c4363fd96ae5");

  const qpon: Qpon = new Qpon(config, 'http://localhost:3000/api');

  const organizationId = "eaad0588-31c9-4971-909c-dd796edca42b";

  const customer = new Customer();
  customer.name = "Test Customer";
  customer.email = "test.customer@example.com";
  customer.externalId = "test-customer-1";

  const result = await qpon.CUSTOMERS.upsertCustomer(organizationId, customer);
  console.log(result);
}

test();
