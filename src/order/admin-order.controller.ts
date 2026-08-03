import { Roles } from '@/common/decorators/roles.decorator';
import { OrderItemStatus } from '@/database/generated/prisma/enums';
import { AdminOrderItemResponseDto } from '@/order/dto/admin-order-item-response.dto';
import { OrderItemResponseDto } from '@/order/dto/order-item-response.dto';
import { UpdateOrderItemStatusDto } from '@/order/dto/update-order-item-status.dto';
import { OrderService } from '@/order/order.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin - Order Queue')
@ApiBearerAuth()
@Controller('admin/order-items')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({
    summary: 'Get the kitchen order queue',
    description:
      'Defaults to PENDING and COOKING items only. Pass ?status= to filter to a specific status.',
  })
  @ApiQuery({
    name: 'status',
    enum: ['PENDING', 'COOKING', 'SERVED'],
    required: false,
  })
  @ApiOkResponse({
    description: 'Order queue.',
    type: [AdminOrderItemResponseDto],
  })
  async getQueue(
    @Query('status') status?: OrderItemStatus,
  ): Promise<AdminOrderItemResponseDto[]> {
    const items = await this.orderService.getQueue(
      status ? [status] : undefined,
    );
    return items.map(
      (item) =>
        new AdminOrderItemResponseDto({
          id: item.id,
          tableSessionId: item.orderRound.tableSessionId,
          tableNumber: item.orderRound.tableSession.diningTable.tableNumber,
          roundNumber: item.orderRound.roundNumber,
          submittedAt: item.orderRound.submittedAt,
          quantity: item.quantity,
          nameSnapshot: item.nameSnapshot,
          note: item.note,
          status: item.status,
          startedAt: item.startedAt,
          estimatedMinutes: item.estimatedMinutes,
          imageUrl: item.menuItem.imageUrl,
        }),
    );
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({
    summary: 'Update an order item status',
    description:
      'Valid forward transitions only: PENDING -> COOKING -> SERVED.',
  })
  @ApiOkResponse({
    description: 'Order item updated.',
    type: OrderItemResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Order item not found.' })
  @ApiBadRequestResponse({ description: 'Invalid status transition.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ): Promise<OrderItemResponseDto> {
    const item = await this.orderService.updateItemStatus(id, dto.status);
    return new OrderItemResponseDto(item);
  }
}
