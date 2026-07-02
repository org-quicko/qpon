import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  const config = new QponCredentials(
    '2cdc1eac060a5521837f8012a8486317',
    '691dd1c63f1021bf959e260abf9e86156bd65222ad4c44bb245abb45c840a595'
  );

  const qpon: Qpon = new Qpon(config, 'http://localhost:5000/api');

  const result = await qpon.COUPONITEM.removeItemFromCoupon(
    'b08dc69a-d9b4-4cea-bf00-c1057b34f80d',
    '46576ef0-13e1-4ec1-a51c-382c661ec0d8',
    '<item_id>'
  );
  console.log(JSON.stringify(result, null, 2));
}

test();
