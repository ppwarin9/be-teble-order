import { Prisma, StoreSetting } from '@/database/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreSettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSingleton(): Promise<StoreSetting | null> {
    return this.prisma.storeSetting.findFirst();
  }

  async create(data: Prisma.StoreSettingCreateInput): Promise<StoreSetting> {
    return this.prisma.storeSetting.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.StoreSettingUpdateInput,
  ): Promise<StoreSetting> {
    return this.prisma.storeSetting.update({
      where: { id },
      data,
    });
  }
}
