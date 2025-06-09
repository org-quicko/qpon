import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CustomerCouponCode } from '../entities/customer-coupon-code.entity';
import { LoggerService } from './logger.service';
import {
  CreateCustomerCouponCodeDto,
  UpdateCustomerCouponCodeDto,
} from '../dtos/customer-coupon-code.dto';
import { CouponCode } from '../entities/coupon-code.entity';
import { CustomersService } from './customer.service';
import { CustomerCouponCodeConverter } from '../converters/customer-coupon-code.converter';

@Injectable()
export class CustomerCouponCodeService {
  constructor(
    @InjectRepository(CustomerCouponCode)
    private customerCouponCodeRepository: Repository<CustomerCouponCode>,
    private customerCouponCodeConverter: CustomerCouponCodeConverter,
    private customersService: CustomersService,
    private logger: LoggerService,
    private dataSource: DataSource,
  ) {}

  async addCustomers(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    body: CreateCustomerCouponCodeDto,
  ) {
    this.logger.info('START: addCustomers service');
    return this.dataSource.transaction(async (manager) => {
      try {
        const couponCode = await manager.findOne(CouponCode, {
          where: {
            couponCodeId,
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
          },
        });

        if (!couponCode) {
          this.logger.warn('Coupon code not found', { couponCodeId });
          throw new NotFoundException('Coupon code not found');
        }

        const existingCustomers =
          await this.customersService.validateCustomersExist(
            body.customers,
            manager,
          );

        const couponCodeCustomers = existingCustomers.map((customer) => {
          return manager.create(CustomerCouponCode, { couponCode, customer });
        });

        const savedCustomerCouponCode = await manager.save(
          CustomerCouponCode,
          couponCodeCustomers,
        );

        this.logger.info('END: addCustomers service');
        return this.customerCouponCodeConverter.convert(
          savedCustomerCouponCode,
        );
      } catch (error) {
        this.logger.error(`Error in addCustomers:`, error);

        if (
          error instanceof NotFoundException ||
          error.name === 'BadRequestException'
        ) {
          throw error;
        }

        throw new HttpException(
          'Failed to add customers for a coupon code',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async fetchCustomers(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    skip: number = 0,
    take: number = 10,
  ) {
    this.logger.info('START: fetchCustomers service');
    try {
      const customers = await this.customerCouponCodeRepository.find({
        relations: {
          customer: true,
          couponCode: true,
        },
        where: {
          couponCode: {
            couponCodeId,
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
          },
        },
        select: {
          customer: {
            customerId: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        skip,
        take,
      });

      if (!customers) {
        this.logger.info('Customers not found');
      }

      this.logger.info('END: fetchCustomers service');
      return this.customerCouponCodeConverter.convert(customers, skip, take);
    } catch (error) {
      this.logger.error(`Error in fetchCustomers:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCustomerForValidation(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
  ) {
    this.logger.info('START: fetchCustomerForValidation service');
    try {
      const customers = await this.customerCouponCodeRepository.findOne({
        relations: {
          customer: true,
          couponCode: {
            organization: true,
          },
        },
        where: {
          couponCode: {
            couponCodeId,
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
          },
        },
      });

      if (!customers) {
        this.logger.info('Customers not found');
      }

      this.logger.info('END: fetchCustomerForValidation service');
      return customers;
    } catch (error) {
      this.logger.error(
        `Error in fetchCustomerForValidation: `,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCustomers(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    body: UpdateCustomerCouponCodeDto,
  ) {
    this.logger.info('START: updateCustomers service');
    return this.dataSource.transaction(async (manager) => {
      try {
        const couponCode = await manager.findOne(CouponCode, {
          where: {
            couponCodeId,
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
          },
        });

        if (!couponCode) {
          this.logger.warn('Coupon code not found');
          throw new NotFoundException('Coupon code not found');
        }

        const customers = await this.customersService.validateCustomersExist(
          body.customers!,
          manager,
        );

        await manager.delete(CustomerCouponCode, {
          couponCode: { couponCodeId },
        });

        const updatedCustomers = customers.map((customer) => {
          return manager.create(CustomerCouponCode, {
            couponCode,
            customer,
          });
        });

        await manager.save(CustomerCouponCode, updatedCustomers);

        this.logger.info('END: updateCustomers service');
        return this.customerCouponCodeConverter.convert(updatedCustomers);
      } catch (error) {
        this.logger.error(`Error in updateCustomers:`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to update customers',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async removeCustomer(
    couponId: string,
    campaignId: string,
    couponCodeId: string,
    customerId: string,
  ) {
    this.logger.info('START: removeCustomer service');
    try {
      const customerCouponCode = await this.customerCouponCodeRepository.find({
        relations: {
          couponCode: true,
          customer: true,
        },
        where: {
          couponCode: {
            couponCodeId,
            campaign: {
              campaignId,
            },
            coupon: {
              couponId,
            },
          },
          customer: {
            customerId,
          },
        },
        select: {
          couponCode: {
            couponCodeId: true,
          },
        },
      });

      if (!customerCouponCode) {
        this.logger.warn('Customer coupon code entry not found');
        throw new NotFoundException('Customer coupon code entry not found');
      }

      await this.customerCouponCodeRepository.delete({
        couponCode: {
          couponCodeId,
        },
        customer: {
          customerId,
        },
      });

      this.logger.info('END: removeCustomer service');
      return this.customerCouponCodeConverter.convert(customerCouponCode);
    } catch (error) {
      this.logger.error(`Error in removeCustomer:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to remove customer from coupon code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
