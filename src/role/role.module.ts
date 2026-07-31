import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RoleRepositoryInterface } from './role.repository.interface';

@Module({
  providers: [
    RoleService,
    { provide: RoleRepositoryInterface, useClass: RoleRepository },
  ],
  controllers: [RoleController],
  exports: [RoleService, RoleRepositoryInterface],
})
export class RoleModule {}
