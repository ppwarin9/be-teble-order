import { Customer } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  CustomerRepositoryInterface,
  UpsertCustomerData,
} from '@/customer/customer.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerRepository extends CustomerRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async upsertByLineUserId(data: UpsertCustomerData): Promise<Customer> {
    return this.prisma.customer.upsert({
      where: { lineUserId: data.lineUserId },
      create: data,
      update: {
        displayName: data.displayName,
        pictureUrl: data.pictureUrl,
      },
    });
  }

  async getById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { id } });
  }
}
