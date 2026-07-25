import { Module } from '@nestjs/common';
import { DiningTableService } from './dining-table.service';
import { DiningTableController } from './dining-table.controller';
import { DiningTableRepository } from '@/dining-table/dining-table.repository';

@Module({
  controllers: [DiningTableController],
  providers: [DiningTableService, DiningTableRepository],
})
export class DiningTableModule {}
