import { AdminOrderController } from '@/order/admin-order.controller';
import { CustomerOrderController } from '@/order/customer-order.controller';
import { OrderRepository } from '@/order/order.repository';
import { OrderRepositoryInterface } from '@/order/order.repository.interface';
import { OrderService } from '@/order/order.service';
import { CartModule } from '@/cart/cart.module';
import { SessionMemberModule } from '@/session-member/session-member.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CartModule, SessionMemberModule],
  controllers: [CustomerOrderController, AdminOrderController],
  providers: [
    OrderService,
    { provide: OrderRepositoryInterface, useClass: OrderRepository },
  ],
  exports: [OrderService, OrderRepositoryInterface],
})
export class OrderModule {}
