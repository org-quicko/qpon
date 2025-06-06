import { LoggerFactory } from '@org.quicko/core';
import * as winston from 'winston';
import { Customer } from '@org.quicko.qpon/core';
import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  LoggerFactory.setLogger("logger", winston.createLogger());
  const config = new QponCredentials("f5f0915ac72b98713051630ebe72a5ba", "761ac8f7856e251d86db8acc496a8d5aca300540033dfff9c47c04f6002d472c");

  const qpon: Qpon = new Qpon(config, 'http://localhost:3000/api');

  const organizationId = "581e2405-302c-4952-8a8b-c044dea4c854";

  const customer = new Customer();
  customer.name = "Test Customer";
  customer.email = "test.customer@example.com";
  customer.externalId = "test-customer-1";

  const result = await qpon.CUSTOMERS.upsertCustomer(organizationId, customer);
  console.log(result);
}

test();
