import { BillShare } from '@/database/generated/prisma/client';
import { BillShareStatus } from '@/database/generated/prisma/enums';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BillShareRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<BillShare | null> {
    return this.prisma.billShare.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: BillShareStatus): Promise<BillShare> {
    return this.prisma.billShare.update({ where: { id }, data: { status } });
  }

  async areAllSharesPaid(billId: string): Promise<boolean> {
    const unpaidShare = await this.prisma.billShare.findFirst({
      where: { billId, status: { not: 'PAID' } },
    });
    return !unpaidShare;
  }
}
