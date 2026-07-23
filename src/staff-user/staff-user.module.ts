import { Module } from '@nestjs/common';
import { StaffUserService } from './staff-user.service';
import { StaffUserController } from './staff-user.controller';
import { StaffUserRepository } from '@/staff-user/staff-user.repository';
import { SecurityModule } from '@/shared/security/security.module';
import { RoleModule } from '@/role/role.module';

@Module({
  imports: [SecurityModule, RoleModule],
  controllers: [StaffUserController],
  providers: [StaffUserService, StaffUserRepository],
  exports: [StaffUserService, StaffUserRepository],
})
export class StaffUserModule {}
