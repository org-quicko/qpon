import { Item } from '@org-quicko/qpon-core';
import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  const config = new QponCredentials("5e6921d401c4f8ed4adb6e17c8335d69", "571f98a459e41b78ba5896b514e3706ddcb93d424a1521edbd50c4363fd96ae5");

  const qpon: Qpon = new Qpon(config, 'http://localhost:3000/api');

  const organizationId = "eaad0588-31c9-4971-909c-dd796edca42b";

  const item = new Item();
  item.name = "Test Item";
  item.description = "This is a test item.";
  item.externalId = "test-item-1"

  const result = await qpon.ITEM.upsertItem(organizationId, item);
  console.log(result);
}

test();