import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { roleEnum } from '../enums';
import { OrganizationUser } from '../entities/organization-user.entity';

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
            REFRESH MATERIALIZED VIEW organizations_mv WITH DATA;   
    `);

    await event.manager.transaction(async (manager) => {
      const superAdmin = await manager.findOne(User, {
        where: {
          role: roleEnum.SUPER_ADMIN,
        },
      });

      const organizationUserEntity = manager.create(OrganizationUser, {
        organizationId: event.entity.organizationId,
        user: {
          userId: superAdmin!.userId,
        },
        role: roleEnum.SUPER_ADMIN,
      });

      await manager.save(OrganizationUser, organizationUserEntity);
    });
  }
}
