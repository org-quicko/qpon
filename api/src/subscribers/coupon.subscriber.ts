import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Coupon } from '../entities/coupon.entity';

@EventSubscriber()
export class CouponSubscriber implements EntitySubscriberInterface<Coupon> {
  listenTo() {
    return Coupon;
  }

  async afterInsert(event: InsertEvent<Coupon>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`    
            REFRESH MATERIALIZED VIEW coupon_summary_mv WITH DATA;    
    `);
  }
}
