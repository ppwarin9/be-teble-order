import { Module } from '@nestjs/common';
import { StaffUserService } from './staff-user.service';
import { StaffUserController } from './staff-user.controller';
import { StaffUserRepository } from '@/staff-user/staff-user.repository';
import { HashModule } from '@/infrastructure/hash/hash.module';
import { RoleModule } from '@/role/role.module';

@Module({
  imports: [HashModule, RoleModule],
  controllers: [StaffUserController],
  providers: [StaffUserService, StaffUserRepository],
  exports: [StaffUserService, StaffUserRepository],
})
export class StaffUserModule {}
