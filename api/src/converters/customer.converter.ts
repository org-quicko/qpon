import { Injectable } from '@nestjs/common';
import { CustomerDto } from 'src/dtos';
import { Customer } from 'src/entities/customer.entity';

@Injectable()
export class CustomerConverter {
  convert(customer: Customer): CustomerDto {
    const customerDto = new CustomerDto();

    customerDto.customerId = customer.customerId;
    customerDto.name = customer.name;
    customerDto.email = customer.email;
    customerDto.phone = customer.phone;
    customerDto.externalId = customer.externalId;
    customerDto.createdAt = customer.createdAt;
    customerDto.updatedAt = customer.updatedAt;

    return customerDto;
  }
}
