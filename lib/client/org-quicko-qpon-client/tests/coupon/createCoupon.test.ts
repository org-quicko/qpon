import { LoggerFactory } from '@org.quicko/core';
import * as winston from 'winston';
import { Coupon, DiscountType, ItemConstraint } from '@org.quicko.qpon/core';
import { Qpon } from '../../src/client/Qpon';
import { QponCredentials } from '../../src/beans';

async function test() {
  LoggerFactory.setLogger("logger", winston.createLogger());
  const config = new QponCredentials("2fcf3f672391a4dd9e45ac7b6fca9d14", "160cb45d383040e16cbd287f6dd81e8f6336e36fc5dffa13c32d86aac74a860e");

  const qpon: Qpon = new Qpon(config,
    'https://dev-qpon.quicko.com/api'
  );

  const data = new Coupon();

  data.name = 'Test coupon 1';
  data.discountType = DiscountType.FIXED;
  data.discountValue = 200;
  data.itemConstraint = ItemConstraint.ALL;

  const result = await qpon.COUPONS.createCoupon("677908f1-691d-42b7-a473-678114dcd6f9", data)
  console.log(result);
}

test()