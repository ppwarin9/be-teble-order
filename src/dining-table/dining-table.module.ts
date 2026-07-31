import { Module } from '@nestjs/common';
import { DiningTableService } from './dining-table.service';
import { DiningTableController } from './dining-table.controller';
import { DiningTableRepository } from '@/dining-table/dining-table.repository';
import { DiningTableRepositoryInterface } from '@/dining-table/dining-table.repository.interface';

@Module({
  controllers: [DiningTableController],
  providers: [
    DiningTableService,
    {
      provide: DiningTableRepositoryInterface,
      useClass: DiningTableRepository,
    },
  ],
  exports: [DiningTableService, DiningTableRepositoryInterface],
})
export class DiningTableModule {}
