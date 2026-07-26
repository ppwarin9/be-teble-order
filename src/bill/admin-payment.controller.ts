import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/auth/types/jwt-payload.type';
import { PaymentResponseDto } from '@/bill/dto/payment-response.dto';
import { PaymentService } from '@/bill/payment.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Controller, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin - Payment')
@ApiBearerAuth()
@Controller('admin/payments')
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Patch(':id/confirm')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({
    summary: 'Confirm a customer-initiated payment',
    description:
      'Used after a customer creates and notifies a payment (e.g. PromptPay). Marks the bill share as PAID and settles the bill once every share is paid.',
  })
  @ApiOkResponse({
    description: 'Payment confirmed.',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Payment not found.' })
  @ApiConflictResponse({ description: 'Payment has already been confirmed.' })
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.confirmPayment(user.id, id);
    return new PaymentResponseDto(payment);
  }

  @Patch(':id/fail')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Mark a payment as failed' })
  @ApiOkResponse({
    description: 'Payment marked as failed.',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Payment not found.' })
  async fail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.failPayment(id);
    return new PaymentResponseDto(payment);
  }

  @Post('bill-shares/:id/cash')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({
    summary: 'Record a cash payment collected in person',
    description:
      'Creates and immediately confirms a CASH payment for the given bill share, without requiring the customer to create one first.',
  })
  @ApiCreatedResponse({
    description: 'Cash payment recorded.',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Bill share not found.' })
  @ApiConflictResponse({
    description: 'This bill share has already been paid.',
  })
  async markCashPaid(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) billShareId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.markCashPaid(
      user.id,
      billShareId,
    );
    return new PaymentResponseDto(payment);
  }
}
