import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomerDto } from '../dtos';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  /**
   * Create customer
   */
  async createCustomer(organizationId: string, @Body() body: CustomerDto) {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch customers
   */
  async fetchCustomers(organizationId: string, skip?: number, take?: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * Update customer
   */
  async updateCustomer(
    organizationId: string,
    customerId: string,
    @Body() body: any,
  ) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete customer
   */
  async deleteCustomer(organizationId: string, customerId: string) {
    throw new Error('Method not implemented.');
  }
}
