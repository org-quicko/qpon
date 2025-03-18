import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos';
import { LoggerService } from './logger.service';
import { CustomerConverter } from 'src/converters/customer.converter';
import { statusEnum } from '../enums';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
    private customerConverter: CustomerConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) {}

  /**
   * Create customer
   */
  async createCustomer(organizationId: string, body: CreateCustomerDto) {
    this.logger.info('START: createCustomer service');
    try {
      const existingCustomer = await this.customersRepository.findOne({
        where: {
          email: body.email,
          organization: {
            organizationId,
          },
        },
      });

      if (existingCustomer) {
        this.logger.warn('Customer already exists in the organization');
        throw new ConflictException(
          'Customer already exists in the organization',
        );
      }

      const customerEntity = this.customersRepository.create({
        name: body.name,
        email: body.email,
        phone: body.phone,
        externalId: body.externalId,
        organization: {
          organizationId,
        },
      });

      const savedCustomer = await this.customersRepository.save(customerEntity);

      this.logger.info('END: createCustomer service');
      return this.customerConverter.convert(savedCustomer);
    } catch (error) {
      this.logger.error(`Error in createCustomer: ${error.message}`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch customers
   */
  async fetchCustomers(
    organizationId: string,
    skip?: number,
    take?: number,
    whereOptions: FindOptionsWhere<Customer> = {},
  ) {
    this.logger.info('START: fetchCustomers service');
    try {
      const customers = await this.customersRepository.find({
        where: {
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
          ...whereOptions,
        },
        skip,
        take,
      });

      if (!customers || customers.length == 0) {
        this.logger.warn('Customers not found');
        throw new NotFoundException('Customers not found');
      }

      this.logger.info('END: fetchCustomers service');
      return customers.map((customer) =>
        this.customerConverter.convert(customer),
      );
    } catch (error) {
      this.logger.error(`Error in fetchCustomers: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    organizationId: string,
    customerId: string,
    body: UpdateCustomerDto,
  ) {
    this.logger.info('START: updateCustomer service');
    try {
      const existingCustomer = await this.customersRepository.findOne({
        where: {
          customerId,
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
        },
      });

      if (!existingCustomer) {
        this.logger.warn('Customer not found');
        throw new NotFoundException('Customer not found');
      }

      await this.customersRepository.update(customerId, body);

      const updatedCustomer = await this.customersRepository.findOne({
        where: {
          customerId,
          organization: {
            organizationId,
          },
        },
      });

      this.logger.info('END: updateCustomer service');
      return this.customerConverter.convert(updatedCustomer!);
    } catch (error) {
      this.logger.error(`Error in updateCustomer`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(organizationId: string, customerId: string) {
    this.logger.info('START: deleteCustomer service');
    return this.datasource.transaction(async (manager) => {
      try {
        const customer = await manager.findOne(Customer, {
          where: {
            customerId,
            organization: {
              organizationId,
            },
            status: statusEnum.ACTIVE,
          },
        });

        if (!customer) {
          this.logger.warn('Customer not found', customerId);
          throw new NotFoundException('Customer not found');
        }

        const customerCouponCodes = await manager.find(CustomerCouponCode, {
          where: {
            customer: {
              customerId,
            },
          },
        });

        if (customerCouponCodes) {
          await Promise.all(
            customerCouponCodes.map(async (customerCouponCode) => {
              await manager.delete(CustomerCouponCode, {
                customer: {
                  customerId: customerCouponCode.customerId,
                },
                couponCode: {
                  couponCodeId: customerCouponCode.couponCodeId,
                },
              });
            }),
          );
        }

        await manager.update(Customer, customerId, {
          status: statusEnum.INACTIVE,
        });

        this.logger.info('END: deleteCustomer service');
        return this.customerConverter.convert(customer);
      } catch (error) {
        this.logger.error(`Error in deleteCustomer`, error);

        if (error instanceof NotFoundException) {
          throw error;
        }

        throw new HttpException(
          'Failed to delete customer',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async validateCustomersExist(customers: string[], manager: EntityManager) {
    this.logger.info('START: validateCustomersExist service');
    try {
      const customersRepository = manager.getRepository(Customer);
      const existingCustomers = await customersRepository.find({
        where: { customerId: In(customers), status: statusEnum.ACTIVE },
      });

      const existingCustomerIds = existingCustomers.map(
        (customer) => customer.customerId,
      );

      const missingCustomerIds = customers.filter(
        (id) => !existingCustomerIds.includes(id),
      );
      if (missingCustomerIds.length > 0) {
        this.logger.warn('Some customers does not exist');
        throw new BadRequestException(
          `Customer with IDs ${missingCustomerIds.join(', ')} do not exist.`,
        );
      }

      this.logger.info('END: validateCustomersExist service');
      return existingCustomers;
    } catch (error) {
      this.logger.error(
        `Error in validateCustomersExist: ${error.message}`,
        error,
      );

      throw error;
    }
  }

  async fetchCustomer(organizationId: string, customerId: string) {
    this.logger.info('START: fetchCustomer service');
    try {
      const customer = await this.customersRepository.findOne({
        where: {
          customerId,
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
        },
      });

      if (!customer) {
        this.logger.warn('Customer not found');
        throw new NotFoundException('Customer not found');
      }

      this.logger.info('END: fetchCustomer service');
      return customer;
    } catch (error) {
      this.logger.error(`Error in fetchCustomer: ${error.message}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
