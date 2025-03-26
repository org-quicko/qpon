import { PaginatedList } from '../dtos/paginated-list.dto';

export abstract class PaginatedListConverter<T1, T2> {
  private converter: any;

  constructor(converter: any) {
    this.converter = converter;
  }

  convert(entities: Array<T1>, skip: number, take: number, count?: number) {
    const dtos = entities.map((entity) => this.converter.convert(entity));

    return PaginatedList.Builder.build<T2>(dtos, skip, take, count);
  }
}
