import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Organization } from '../entities/organization.entity';

@EventSubscriber()
export class OrganizationSubscriber
  implements EntitySubscriberInterface<Organization>
{
  listenTo() {
    return Organization;
  }

  async afterInsert(event: InsertEvent<Organization>) {
    await event.queryRunner.connect();

    await event.queryRunner.query(`    
            REFRESH MATERIALIZED VIEW organization_summary_mv WITH DATA;    
    `);
  }
}
