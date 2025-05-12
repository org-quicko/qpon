import * as winston from "winston";
import { LoggerFactory } from "@org.quicko/core";
import { DiscountType, SortOrder } from "@org.quicko.qpon/core";
import { QponCredentials } from "../../src/beans";
import { Qpon } from "../../src/client/Qpon";

async function test() {
  LoggerFactory.setLogger('logger', winston.createLogger());
  const config = new QponCredentials(
    '2fcf3f672391a4dd9e45ac7b6fca9d14',
    '160cb45d383040e16cbd287f6dd81e8f6336e36fc5dffa13c32d86aac74a860e'
  );

  const qpon: Qpon = new Qpon(config, 'https://dev-qpon.quicko.com/api');

  const result = await qpon.OFFERS.getAllOffers("4d7b44de-da71-4555-a7d3-71df8f30b212", "184F8385D39B45F5E0630100007F2EE2", "2227362000000050497", SortOrder.DESC, DiscountType.FIXED, 0, 10);

  console.log(result);
}

test()
