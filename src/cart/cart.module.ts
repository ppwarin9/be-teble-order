import { CartController } from '@/cart/cart.controller';
import { CartRepository } from '@/cart/cart.repository';
import { CartRepositoryInterface } from '@/cart/cart.repository.interface';
import { CartService } from '@/cart/cart.service';
import { MenuItemModule } from '@/menu-item/menu-item.module';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [MenuItemModule, SessionMemberModule],
  controllers: [CartController],
  providers: [
    CartService,
    { provide: CartRepositoryInterface, useClass: CartRepository },
  ],
  exports: [CartService, CartRepositoryInterface],
})
export class CartModule {}
