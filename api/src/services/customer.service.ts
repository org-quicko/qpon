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
  ILike,
  In,
  Repository,
} from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos';
import { LoggerService } from './logger.service';
import { CustomerConverter } from 'src/converters/customer.converter';
import { statusEnum } from '../enums';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';
import { CustomerListConverter } from 'src/converters/customer-list.converter';
import { PassThrough } from 'stream';
import { stringify } from 'csv-stringify';
import { CustomerWiseDayWiseRedemptionSummaryMv } from 'src/entities/customer_wise_day_wise_redemption_summary_mv';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,

    @InjectRepository(CustomerWiseDayWiseRedemptionSummaryMv)
    private readonly customerWiseMvRepository: Repository<CustomerWiseDayWiseRedemptionSummaryMv>,

    private customerConverter: CustomerConverter,
    private customerListConverter: CustomerListConverter,
    private logger: LoggerService,
    private datasource: DataSource,
  ) { }

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
          status: statusEnum.ACTIVE,
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
        isdCode: body.isdCode,
        externalId: body.externalId,
        organization: {
          organizationId,
        },
      });

      const savedCustomer = await this.customersRepository.save(customerEntity);

      this.logger.info('END: createCustomer service');
      return this.customerConverter.convert(savedCustomer);
    } catch (error) {
      this.logger.error(`Error in createCustomer:`, error);

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
    skip: number = 0,
    take: number = 10,
    whereOptions: FindOptionsWhere<Customer> = {},
  ) {
    this.logger.info('START: fetchCustomers service');
    try {
      let emailFilter: string = '';

      if (whereOptions.email) {
        emailFilter = whereOptions.email as string;
        delete whereOptions.email;
      }

      const [customers, count] = await this.customersRepository.findAndCount({
        where: {
          organization: {
            organizationId,
          },
          status: statusEnum.ACTIVE,
          ...(emailFilter && { email: ILike(`%${emailFilter}%`) }),
          ...whereOptions,
        },
        skip,
        take,
        order: {
          createdAt: 'DESC',
        },
      });

      if (!customers || customers.length == 0) {
        this.logger.warn('Customers not found');
      }

      this.logger.info('END: fetchCustomers service');
      return this.customerListConverter.convert(customers, skip, take, count);
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

  /**
   * Fetch customer
   */
  async fetchCustomer(organizationId: string, customerId: string) {
    this.logger.info('START: fetchCustomer service');
    try {
      const customer = await this.customersRepository.findOne({
        where: {
          organization: {
            organizationId,
          },
          customerId,
          status: statusEnum.ACTIVE,
        },
      });

      if (!customer) {
        this.logger.warn('Customer not found');
        throw new NotFoundException('Customer not found');
      }

      this.logger.info('END: fetchCustomers service');
      return this.customerConverter.convert(customer);
    } catch (error) {
      this.logger.error(`Error in fetchCustomer:`, error);

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
        `Error in validateCustomersExist:`,
        error,
      );

      throw error;
    }
  }

  async fetchCustomerForValidation(organizationId: string, customerId: string) {
    this.logger.info('START: fetchCustomerForValidation service');
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

      this.logger.info('END: fetchCustomerForValidation service');
      return customer;
    } catch (error) {
      this.logger.error(
        `Error in fetchCustomerForValidation:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async upsertCustomer(organizationId: string, body: CreateCustomerDto) {
    this.logger.info('START: upsertCustomer service');
    try {
      const existingCustomer = await this.customersRepository.findOne({
        where: {
          externalId: body.externalId,
          status: statusEnum.ACTIVE,
          organization: {
            organizationId,
          },
        },
      });

      if (existingCustomer) {
        await this.customersRepository.update(existingCustomer.customerId, {
          name: body.name,
          email: body.email,
          phone: body.phone,
          isdCode: body.isdCode
        });

        const customer = await this.customersRepository.findOne({
          where: {
            customerId: existingCustomer.customerId,
            organization: {
              organizationId,
            },
          },
        });

        this.logger.info('END: upsertCustomer service');
        return this.customerConverter.convert(customer!);
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

      this.logger.info('END: upsertCustomer service');
      return this.customerConverter.convert(savedCustomer);
    } catch (error) {
      this.logger.error(`Error in upsertCustomer`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new HttpException(
        'Failed to upsert customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async streamSalesByCustomerReport(
    organizationId: string,
    from?: string,
    to?: string,
  ): Promise<PassThrough> {
    if (!from || !to) {
      throw new BadRequestException('Time period not configured for report');
    }

    const passThrough = new PassThrough();

    // csv-stringify stream
    const csvStream = stringify({
      header: true,
      columns: [
        { key: 'customer_name', header: 'Customer Name' },
        { key: 'gross_sales', header: 'Gross Sales' },
        { key: 'total_discount', header: 'Discount' },
        { key: 'net_sales', header: 'Net Sales' },
        { key: 'total_redemptions', header: 'Total Redemptions' },
        { key: 'customer_external_id', header: 'Customer External ID' },
      ],
    });

    // pipe CSV into PassThrough for streaming response
    csvStream.pipe(passThrough);

    const dbStream = await this.customerWiseMvRepository
      .createQueryBuilder('customerSummary')
      .where('customerSummary.organization_id = :organizationId', { organizationId })
      .andWhere('customerSummary.date BETWEEN :start AND :end', {
        start: from,
        end: to,
      })
      .select([
        'customerSummary.customer_external_id AS customer_external_id',
        'customerSummary.customer_name AS customer_name',
        'SUM(customerSummary.gross_sale) AS gross_sales',
        'SUM(customerSummary.total_discount) AS total_discount',
        'SUM(customerSummary.net_sale) AS net_sales',
        'SUM(customerSummary.total_redemptions) AS total_redemptions',
      ])
      .groupBy('customerSummary.customer_external_id')
      .addGroupBy('customerSummary.customer_name')
      .orderBy('customerSummary.customer_name', 'ASC')
      .stream();

    // write DB rows into csv-stringify
    dbStream.on('data', (row: any) => {
      csvStream.write(row);
    });

    dbStream.on('end', () => csvStream.end());

    dbStream.on('error', (err) => {
      csvStream.end();
      passThrough.destroy(err);
    });

    return passThrough;
  }
}
