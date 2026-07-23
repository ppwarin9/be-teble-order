import { Module } from '@nestjs/common';
import { StaffUserService } from './staff-user.service';
import { StaffUserRepository } from '@/staff-user/staff-user.repository';

@Module({
  providers: [StaffUserService, StaffUserRepository],
  exports: [StaffUserService, StaffUserRepository],
})
export class StaffUserModule {}
