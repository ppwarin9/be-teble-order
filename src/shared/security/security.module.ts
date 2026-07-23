import { BcryptService } from '@/shared/security/bcrypt.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class SecurityModule {}
