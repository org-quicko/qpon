import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { CouponCode } from '../entities/coupon-code.entity';

@EventSubscriber()
export class CouponCodeSubscriber
  implements EntitySubscriberInterface<CouponCode>
{
  listenTo() {
    return CouponCode;
  }

  async afterInsert(event: InsertEvent<CouponCode>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`    
           REFRESH MATERIALIZED VIEW campaign_summary_mv WITH DATA;    
           REFRESH MATERIALIZED VIEW coupon_summary_mv WITH DATA;    
           REFRESH MATERIALIZED VIEW organization_summary_mv WITH DATA;      
    `);
  }

  async afterUpdate(event: UpdateEvent<CouponCode>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`    
        REFRESH MATERIALIZED VIEW campaign_summary_mv WITH DATA;    
        REFRESH MATERIALIZED VIEW coupon_summary_mv WITH DATA;    
        REFRESH MATERIALIZED VIEW organization_summary_mv WITH DATA;      
    `);
  }
}
