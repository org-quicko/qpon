import { Injectable } from '@nestjs/common';
import { PaginatedList } from '../dtos/paginated-list.dto';
import { OrganizationsMv } from '../entities/organizations_mv.entity';
import { OrganizationMvConverter } from './organizationMv.converter';
import { OrganizationMvDto } from 'src/dtos';

@Injectable()
export class OrganizationsListConverter {
  convert(
    organizationMvs: OrganizationsMv[],
    count: number,
    skip?: number,
    take?: number,
  ): PaginatedList<OrganizationMvDto> {
    const organizationMvConverter = new OrganizationMvConverter();

    const organizationsList = organizationMvs.map((organizationMv) =>
      organizationMvConverter.convert(organizationMv),
    );

    return PaginatedList.Builder.build(
      organizationsList,
      skip ?? 0,
      take ?? 10,
      count,
    );
  }
}
