import { LoggerFactory } from "@org.quicko/core";
import { CreateRedemption } from "@org.quicko.qpon/core";
import * as winston from "winston";
import { QponCredentials } from "../../src/beans";
import { Qpon } from "../../src/client/Qpon";

async function test() {
  LoggerFactory.setLogger('logger', winston.createLogger());
  const config = new QponCredentials(
    '2fcf3f672391a4dd9e45ac7b6fca9d14',
    '160cb45d383040e16cbd287f6dd81e8f6336e36fc5dffa13c32d86aac74a860e'
  );

  const qpon: Qpon = new Qpon(config, 'https://dev-qpon.quicko.com/api');
  
  const data = new CreateRedemption();

  data.code = "TEST101";
  data.baseOrderValue = 200;
  data.discount = 100;
  data.externalItemId = "ytfvbnjk"
  data.externalCustomerId = "1234567890";


  const result = await qpon.REDEMPTIONS.redeemCouponCode("677908f1-691d-42b7-a473-678114dcd6f9", "b967f764-f8b9-48d4-8f8c-1afa7235911f", "d3123fd0-8be0-4a89-b94b-24b295a67866", data);

  console.log(result);
}

test()
