import { Module } from '@nestjs/common';
import { CustomerRepository } from '@/customer/customer.repository';

@Module({
  providers: [CustomerRepository],
  exports: [CustomerRepository],
})
export class CustomerModule {}
