import { Customer } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

export type UpsertCustomerData = {
  lineUserId: string;
  displayName: string;
  pictureUrl: string;
};

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

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
