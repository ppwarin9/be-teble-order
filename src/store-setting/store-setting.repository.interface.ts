import { Prisma, StoreSetting } from '@/database/generated/prisma/client';

export abstract class StoreSettingRepositoryInterface {
  abstract getSingleton(): Promise<StoreSetting | null>;

  abstract create(data: Prisma.StoreSettingCreateInput): Promise<StoreSetting>;

  abstract update(
    id: string,
    data: Prisma.StoreSettingUpdateInput,
  ): Promise<StoreSetting>;
}
