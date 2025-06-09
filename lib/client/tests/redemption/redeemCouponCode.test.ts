import { CreateRedemption } from "@org-quicko/qpon-core";
import { QponCredentials } from "../../src/beans";
import { Qpon } from "../../src/client/Qpon";

async function test() {
  const config = new QponCredentials(
    '2fcf3f672391a4dd9e45ac7b6fca9d14',
    '160cb45d383040e16cbd287f6dd81e8f6336e36fc5dffa13c32d86aac74a860e'
  );

  const qpon: Qpon = new Qpon(config, 'http://localhost:3000/api');
  
  const data = new CreateRedemption();

  data.code = "TEST101";
  data.baseOrderValue = 200;
  data.discount = 100;
  data.externalItemId = "G4F3S6DVG6SDF6";
  data.externalCustomerId = "1234567890";


  const result = await qpon.REDEMPTIONS.redeemCouponCode("677908f1-691d-42b7-a473-678114dcd6f9", data);

  console.log(result);
}

test()
