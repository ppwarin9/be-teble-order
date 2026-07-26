import { CurrentSessionMember } from '@/auth/decorators/current-session-member.decorator';
import { SessionTokenGuard } from '@/auth/guards/session-token.guard';
import { type AuthenticatedSessionMember } from '@/auth/types/session.type';
import { Public } from '@/common/decorators/public.decorator';
import { OrderRoundResponseDto } from '@/order/dto/order-round-response.dto';
import { OrderService } from '@/order/order.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Customer - Order')
@ApiBearerAuth()
@Public()
@UseGuards(SessionTokenGuard)
@Controller('liff/orders')
export class CustomerOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Submit the table's current cart as a new order round",
  })
  @ApiCreatedResponse({
    description: 'Order round submitted.',
    type: OrderRoundResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Cart is empty.' })
  async submit(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
  ): Promise<OrderRoundResponseDto> {
    const round = await this.orderService.submitCart(sessionMember);
    return new OrderRoundResponseDto(round);
  }

  @Get()
  @ApiOperation({
    summary: "Get this table's order history for the current session",
  })
  @ApiOkResponse({
    description: 'List of order rounds.',
    type: [OrderRoundResponseDto],
  })
  async getOrders(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
  ): Promise<OrderRoundResponseDto[]> {
    const rounds = await this.orderService.getRoundsForSession(sessionMember);
    return rounds.map((round) => new OrderRoundResponseDto(round));
  }
}
