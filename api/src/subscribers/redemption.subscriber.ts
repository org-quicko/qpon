import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Redemption } from '../entities/redemption.entity';

@EventSubscriber()
export class RedemptionSubscriber
  implements EntitySubscriberInterface<Redemption>
{
  listenTo() {
    return Redemption;
  }

  async afterInsert(event: InsertEvent<Redemption>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`
            REFRESH MATERIALIZED VIEW campaign_summary_mv WITH DATA;    
            REFRESH MATERIALIZED VIEW coupon_summary_mv WITH DATA;    
            REFRESH MATERIALIZED VIEW organization_summary_mv WITH DATA;    
    `);
  }
}
