import { QponCredentials } from "../../src/beans";
import { Qpon } from "../../src/client/Qpon";

async function test() {
  const config = new QponCredentials(
    'f5f0915ac72b98713051630ebe72a5ba',
    '761ac8f7856e251d86db8acc496a8d5aca300540033dfff9c47c04f6002d472c'
  );

  const qpon: Qpon = new Qpon(config, 'http://localhost:3000/api');

  const result = await qpon.OFFERS.getOffer("581e2405-302c-4952-8a8b-c044dea4c854", "34EA6BF910A85351E0630100007F6B05", "EARLYBIRD" ,"2227362000000050497");

  console.log(result);
}

test()
