import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos';
import { LoggerService } from 'src/services/logger.service';
import { Permissions } from '../decorators/permission.decorator';
import { Customer } from '../entities/customer.entity';

@ApiTags('Customers')
@Controller('/organizations/:organization_id/customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private logger: LoggerService,
  ) {}

  /**
   * Create customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('create', Customer)
  @Post()
  async createCustomer(
    @Param('organization_id') organizationId: string,
    @Body() body: CreateCustomerDto,
  ) {
    this.logger.info('START: createCustomer controller');

    const result = await this.customersService.createCustomer(
      organizationId,
      body,
    );

    this.logger.info('END: createCustomer controller');
    return { message: 'Successfully created customer', result };
  }

  /**
   * Fetch customers
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read_all', Customer)
  @Get()
  async fetchCustomers(
    @Param('organization_id') organizationId: string,
    @Query('email') email?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.info('START: fetchCustomers controller');

    const result = await this.customersService.fetchCustomers(
      organizationId,
      skip,
      take,
      {
        email,
      },
    );

    this.logger.info('END: fetchCustomers controller');
    return { message: 'Successfully fetched customers', result };
  }

  /**
   * Fetch customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('read_all', Customer)
  @Get(':customer_id')
  async fetchCustomer(
    @Param('organization_id') organizationId: string,
    @Param('customer_id') customerId: string,
  ) {
    this.logger.info('START: fetchCustomer controller');

    const result = await this.customersService.fetchCustomer(
      organizationId,
      customerId,
    );

    this.logger.info('END: fetchCustomer controller');
    return { message: 'Successfully fetched customer', result };
  }

  /**
   * Update customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('update', Customer)
  @Patch(':customer_id')
  async updateCustomer(
    @Param('organization_id') organizationId: string,
    @Param('customer_id') customerId: string,
    @Body() body: UpdateCustomerDto,
  ) {
    this.logger.info('START: updateCustomer controller');

    const result = await this.customersService.updateCustomer(
      organizationId,
      customerId,
      body,
    );

    this.logger.info('END: updateCustomer controller');
    return { message: 'Successfully updated customer', result };
  }

  /**
   * Delete customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Permissions('delete', Customer)
  @Delete(':customer_id')
  async deleteCustomer(
    @Param('organization_id') organizationId: string,
    @Param('customer_id') customerId: string,
  ) {
    this.logger.info('START: deleteCustomer controller');

    const result = await this.customersService.deleteCustomer(
      organizationId,
      customerId,
    );

    this.logger.info('END: deleteCustomer controller');
    return { message: 'Successfully deleted customer', result };
  }
}
