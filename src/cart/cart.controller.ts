import { CurrentSessionMember } from '@/auth/decorators/current-session-member.decorator';
import { SessionTokenGuard } from '@/auth/guards/session-token.guard';
import { type AuthenticatedSessionMember } from '@/auth/types/session.type';
import { AddCartItemDto } from '@/cart/dto/add-cart-item.dto';
import { CartItemResponseDto } from '@/cart/dto/cart-item-response.dto';
import { CartResponseDto } from '@/cart/dto/cart-response.dto';
import { UpdateCartItemDto } from '@/cart/dto/update-cart-item.dto';
import { CartService } from '@/cart/cart.service';
import { Public } from '@/common/decorators/public.decorator';
import {
  Body,
  Controller,
  Delete,
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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Customer - Cart')
@ApiBearerAuth()
@Public()
@UseGuards(SessionTokenGuard)
@Controller('liff/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current table's shared cart" })
  @ApiOkResponse({ description: 'The current cart.', type: CartResponseDto })
  async getCurrentCart(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.getCurrentCart(sessionMember);
    return new CartResponseDto(cart);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the shared cart' })
  @ApiCreatedResponse({
    description: 'Item added to the cart.',
    type: CartItemResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  @ApiConflictResponse({ description: 'Menu item is currently unavailable.' })
  async addItem(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
    @Body() dto: AddCartItemDto,
  ): Promise<CartItemResponseDto> {
    const item = await this.cartService.addItem(sessionMember, dto);
    return new CartItemResponseDto(item);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update a cart item (quantity or note)' })
  @ApiOkResponse({
    description: 'Cart item updated.',
    type: CartItemResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cart item not found.' })
  @ApiForbiddenResponse({
    description: 'Cart item does not belong to your table session.',
  })
  async updateItem(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartItemResponseDto> {
    const item = await this.cartService.updateItem(sessionMember, id, dto);
    return new CartItemResponseDto(item);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an item from the shared cart' })
  @ApiNoContentResponse({ description: 'Cart item removed.' })
  @ApiNotFoundResponse({ description: 'Cart item not found.' })
  @ApiForbiddenResponse({
    description: 'Cart item does not belong to your table session.',
  })
  async removeItem(
    @CurrentSessionMember() sessionMember: AuthenticatedSessionMember,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.cartService.removeItem(sessionMember, id);
  }
}
