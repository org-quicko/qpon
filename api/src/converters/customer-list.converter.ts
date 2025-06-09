import { Injectable } from '@nestjs/common';
import { PaginatedListConverter } from './paginated-list.converter';
import { Customer } from '../entities/customer.entity';
import { CustomerDto } from '../dtos';
import { CustomerConverter } from './customer.converter';

@Injectable()
export class CustomerListConverter extends PaginatedListConverter<
  Customer,
  CustomerDto
> {
  constructor() {
    const customerConverter = new CustomerConverter();
    super(customerConverter);
  }
}
