import { Injectable } from '@nestjs/common';
import { CustomerCouponCodeDto } from '../dtos/customer-coupon-code.dto';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { CustomerConverter } from './customer.converter';
import { PaginatedList } from '../dtos/paginated-list.dto';
import { CustomerDto } from 'src/dtos';

@Injectable()
export class CustomerCouponCodeConverter {
  constructor(private customerConverter: CustomerConverter) {}

  convert(
    customerCouponCodes: CustomerCouponCode[],
    skip?: number,
    take?: number,
  ): PaginatedList<CustomerDto> {
    const customerCouponCodeDto = new CustomerCouponCodeDto();

    customerCouponCodeDto.couponCodeId =
      customerCouponCodes[0].couponCode.couponCodeId;

    customerCouponCodeDto.customers = customerCouponCodes.map(
      (customerCouponCode) => {
        return this.customerConverter.convert(customerCouponCode.customer);
      },
    );

    return PaginatedList.Builder.build(
      customerCouponCodeDto.customers,
      skip!,
      take!,
    );
  }
}
