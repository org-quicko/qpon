import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  const config = new QponCredentials('2cdc1eac060a5521837f8012a8486317',
    '691dd1c63f1021bf959e260abf9e86156bd65222ad4c44bb245abb45c840a595');

  const qpon: Qpon = new Qpon(config, 'http://localhost:5000/api');

  const organizationId = "0eb571dd-b758-47b5-b713-95a8a9ce969f";

  const externalId = "test";

  const result = await qpon.ITEM.getAllItems(organizationId, undefined, externalId);
  console.log(result);
}

test();
