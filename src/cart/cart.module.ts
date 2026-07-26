import { CartController } from '@/cart/cart.controller';
import { CartRepository } from '@/cart/cart.repository';
import { CartService } from '@/cart/cart.service';
import { MenuItemModule } from '@/menu-item/menu-item.module';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [MenuItemModule, SessionMemberModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
