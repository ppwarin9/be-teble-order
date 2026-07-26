import { CurrentSessionMember } from '@/auth/decorators/current-session-member.decorator';
import { SessionTokenGuard } from '@/auth/guards/session-token.guard';
import { type AuthenticatedSessionMember } from '@/auth/types/session.type';
import { BillResponseDto } from '@/bill/dto/bill-response.dto';
import { CreatePaymentDto } from '@/bill/dto/create-payment.dto';
import { GenerateBillDto } from '@/bill/dto/generate-bill.dto';
import { PaymentResponseDto } from '@/bill/dto/payment-response.dto';
import { BillService } from '@/bill/bill.service';
import { PaymentService } from '@/bill/payment.service';
import { Public } from '@/common/decorators/public.decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Customer - Bill')
@ApiBearerAuth()
@Public()
@UseGuards(SessionTokenGuard)
@Controller('liff/bills')
export class CustomerBillController {
  constructor(
    private readonly billService: BillService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Generate the bill for this table's current session",
  })
  @ApiCreatedResponse({ description: 'Bill generated.', type: BillResponseDto })
  @ApiConflictResponse({
    description: 'An unpaid bill already exists for this table session.',
  })
  @ApiBadRequestResponse({
    description: 'No billable items found, or invalid payerSessionMemberId.',
  })
  async generate(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
    @Body() dto: GenerateBillDto,
  ): Promise<BillResponseDto> {
    const bill = await this.billService.generateBill(sessionMember, dto);
    return new BillResponseDto(bill);
  }

  @Get()
  @ApiOperation({ summary: "Get this table's bills for the current session" })
  @ApiOkResponse({ description: 'List of bills.', type: [BillResponseDto] })
  async getBills(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
  ): Promise<BillResponseDto[]> {
    const bills = await this.billService.getBillsForSession(sessionMember);
    return bills.map((bill) => new BillResponseDto(bill));
  }

  @Post('bill-shares/:id/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment for one of your own bill shares' })
  @ApiCreatedResponse({
    description: 'Payment created.',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Bill share not found.' })
  @ApiForbiddenResponse({
    description: 'This bill share does not belong to you.',
  })
  @ApiConflictResponse({
    description: 'Already paid, or a payment is already in progress.',
  })
  async createPayment(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
    @Param('id', ParseUUIDPipe) billShareId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.createPayment(
      sessionMember,
      billShareId,
      dto,
    );
    return new PaymentResponseDto(payment);
  }

  @Patch('payments/:id/notify')
  @ApiOperation({
    summary:
      'Notify staff that you have completed payment (e.g. via PromptPay)',
  })
  @ApiOkResponse({
    description: 'Payment marked as notified.',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Payment not found.' })
  @ApiForbiddenResponse({ description: 'This payment does not belong to you.' })
  @ApiConflictResponse({
    description: 'Only a pending payment can be notified.',
  })
  async notify(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
    @Param('id', ParseUUIDPipe) paymentId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.notifyPayment(
      sessionMember,
      paymentId,
    );
    return new PaymentResponseDto(payment);
  }
}
