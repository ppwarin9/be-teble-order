import { Module } from '@nestjs/common';
import { CustomerRepository } from '@/customer/customer.repository';
import { CustomerRepositoryInterface } from '@/customer/customer.repository.interface';

@Module({
  providers: [
    { provide: CustomerRepositoryInterface, useClass: CustomerRepository },
  ],
  exports: [CustomerRepositoryInterface],
})
export class CustomerModule {}
