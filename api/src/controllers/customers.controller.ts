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
import { CustomersService } from '../services/customers.service';
import { CustomerDto } from '../dtos';

@ApiTags('Customers')
@Controller('/:organization_id/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Create customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Post()
  async createCustomer(
    @Param('organization_id') organizationId: string,
    @Body() body: CustomerDto,
  ) {
    return this.customersService.createCustomer(organizationId, body);
  }

  /**
   * Fetch customers
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Get()
  async fetchCustomers(
    @Param('organization_id') organizationId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.customersService.fetchCustomers(organizationId, skip, take);
  }

  /**
   * Update customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Patch(':customer_id')
  async updateCustomer(
    @Param('organization_id') organizationId: string,
    @Param('customer_id') customerId: string,
    @Body() body: any,
  ) {
    return this.customersService.updateCustomer(
      organizationId,
      customerId,
      body,
    );
  }

  /**
   * Delete customer
   */
  @ApiResponse({ status: 200, description: 'Successful response' })
  @Delete(':customer_id')
  async deleteCustomer(
    @Param('organization_id') organizationId: string,
    @Param('customer_id') customerId: string,
  ) {
    return this.customersService.deleteCustomer(organizationId, customerId);
  }
}
