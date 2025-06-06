import { LoggerFactory } from '@org-quicko/core';
import * as winston from 'winston';
import { Item } from '@org-quicko/qpon-core';
import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  LoggerFactory.setLogger("logger", winston.createLogger());
  const config = new QponCredentials("f5f0915ac72b98713051630ebe72a5ba", "761ac8f7856e251d86db8acc496a8d5aca300540033dfff9c47c04f6002d472c");

  const qpon: Qpon = new Qpon(config, 'https://dev-qpon.quicko.com/api');

  const organizationId = "581e2405-302c-4952-8a8b-c044dea4c854";

  const item = new Item();
  item.name = "Test Item";
  item.description = "This is a test item.";
  item.externalId = "test-item-1"

  const result = await qpon.ITEM.upsertItem(organizationId, item);
  console.log(result);
}

test();