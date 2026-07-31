import { Customer } from '@/database/generated/prisma/client';

export type UpsertCustomerData = {
  lineUserId: string;
  displayName: string;
  pictureUrl: string;
};

export abstract class CustomerRepositoryInterface {
  abstract upsertByLineUserId(data: UpsertCustomerData): Promise<Customer>;

  abstract getById(id: string): Promise<Customer | null>;
}
