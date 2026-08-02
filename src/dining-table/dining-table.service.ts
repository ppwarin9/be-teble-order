import { DiningTable } from '@/database/generated/prisma/client';
import { DiningTableRepositoryInterface } from '@/dining-table/dining-table.repository.interface';
import { CreateDiningTableDto } from '@/dining-table/dto/create-dining-table.dto';
import { UpdateDiningTableDto } from '@/dining-table/dto/update-dining-table.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class DiningTableService {
  constructor(private readonly repository: DiningTableRepositoryInterface) {}

  async create(dto: CreateDiningTableDto): Promise<DiningTable> {
    const existingTable = await this.repository.findByTableNumber(
      dto.tableNumber,
    );
    if (existingTable) {
      throw new ConflictException(
        `Table number '${dto.tableNumber}' already exists`,
      );
    }

    const qrToken = crypto.randomUUID();

    return this.repository.create({
      tableNumber: dto.tableNumber,
      qrToken,
    });
  }

  async getAll(): Promise<DiningTable[]> {
    return this.repository.getAll();
  }

  async getOne(id: string): Promise<DiningTable> {
    return this.findByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateDiningTableDto): Promise<DiningTable> {
    await this.findByIdOrThrow(id);

    if (dto.tableNumber) {
      const existingTable = await this.repository.findByTableNumber(
        dto.tableNumber,
      );
      if (existingTable && existingTable.id !== id) {
        throw new ConflictException(
          `Table number '${dto.tableNumber}' already exists`,
        );
      }
    }

    return this.repository.update(id, dto);
  }

  async regenerateQr(id: string): Promise<DiningTable> {
    await this.findByIdOrThrow(id);
    const newQrToken = crypto.randomUUID();

    return this.repository.update(id, {
      qrToken: newQrToken,
      qrGeneratedAt: new Date(),
    });
  }

  async remove(id: string): Promise<void> {
    await this.findByIdOrThrow(id);

    const hasActiveSession = await this.repository.hasOpenSession(id);
    if (hasActiveSession) {
      throw new ConflictException(
        'Cannot delete this table because it has an active session',
      );
    }
    await this.repository.delete(id);
  }

  private async findByIdOrThrow(id: string): Promise<DiningTable> {
    const table = await this.repository.getById(id);
    if (!table) {
      throw new NotFoundException('Dining table not found');
    }
    return table;
  }
}
