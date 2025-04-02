import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Campaign } from '../entities/campaign.entity';

@EventSubscriber()
export class CampaignSubscriber implements EntitySubscriberInterface<Campaign> {
  listenTo() {
    return Campaign;
  }

  async afterInsert(event: InsertEvent<Campaign>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`    
            REFRESH MATERIALIZED VIEW campaign_summary_mv WITH DATA;    
    `);
  }

  async afterUpdate(event: UpdateEvent<Campaign>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`    
      REFRESH MATERIALIZED VIEW campaign_summary_mv WITH DATA;    
    `);
  }
}
