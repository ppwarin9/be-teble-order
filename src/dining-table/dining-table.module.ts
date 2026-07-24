import { Module } from '@nestjs/common';
import { DiningTableService } from './dining-table.service';
import { DiningTableController } from './dining-table.controller';

@Module({
  controllers: [DiningTableController],
  providers: [DiningTableService],
})
export class DiningTableModule {}
