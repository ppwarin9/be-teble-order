import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CartService } from '@/cart/cart.service';
import { CartRepositoryInterface } from '@/cart/cart.repository.interface';
import { MenuItemService } from '@/menu-item/menu-item.service';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { AuthenticatedSessionMember } from '@/auth/types/session.type';

const tableSessionId = 'table-session-1';

const sessionMember: AuthenticatedSessionMember = {
  id: 'member-1',
  customerId: 'customer-1',
  tableSessionId,
  tableSession: {
    id: tableSessionId,
    status: 'OPEN',
    diningTableId: 'table-1',
  },
};

const availableMenuItem = {
  id: 'menu-item-1',
  price: 15000,
  isAvailable: true,
};

describe('CartService', () => {
  let service: CartService;
  let cartRepository: jest.Mocked<CartRepositoryInterface>;
  let menuItemService: jest.Mocked<MenuItemService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepositoryInterface,
          useValue: {
            findByTableSessionId: jest.fn(),
            create: jest.fn(),
            findCartItemById: jest.fn(),
            createCartItem: jest.fn(),
            updateCartItem: jest.fn(),
            deleteCartItem: jest.fn(),
            deleteAllCartItems: jest.fn(),
          },
        },
        {
          provide: MenuItemService,
          useValue: { getById: jest.fn() },
        },
        {
          provide: RealtimeGateway,
          useValue: { emitToTableSession: jest.fn(), emitToAdmin: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CartService);
    cartRepository = module.get(CartRepositoryInterface);
    menuItemService = module.get(MenuItemService);

    menuItemService.getById.mockResolvedValue(availableMenuItem as never);
    cartRepository.findByTableSessionId.mockResolvedValue({
      id: 'cart-1',
      tableSessionId,
      cartItems: [],
    } as never);
    cartRepository.createCartItem.mockResolvedValue({
      id: 'cart-item-1',
    } as never);
  });

  describe('addItem', () => {
    it('rejects adding an unavailable menu item', async () => {
      menuItemService.getById.mockResolvedValue({
        ...availableMenuItem,
        isAvailable: false,
      } as never);

      await expect(
        service.addItem(sessionMember, {
          menuItemId: 'menu-item-1',
          quantity: 1,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(cartRepository.createCartItem).not.toHaveBeenCalled();
    });

    it('never trusts a client-supplied price — creates the cart item using only menuItemId/quantity/note', async () => {
      await service.addItem(sessionMember, {
        menuItemId: 'menu-item-1',
        quantity: 2,
        note: 'no chili',
      });

      const createCall = cartRepository.createCartItem.mock.calls[0][0];
      expect(createCall).toEqual({
        cartId: 'cart-1',
        menuItemId: 'menu-item-1',
        addedBy: sessionMember.id,
        quantity: 2,
        note: 'no chili',
      });
      // AddCartItemDto has no price field at all, so there is nothing for a malicious
      // client to override here — price is always resolved server-side from menuItemService.
      expect(createCall).not.toHaveProperty('price');
      expect(createCall).not.toHaveProperty('unitPrice');
    });
  });

  describe('cross-table IDOR protection', () => {
    const otherTablesCartItem = {
      id: 'cart-item-1',
      cart: { id: 'cart-9', tableSessionId: 'a-different-table-session' },
    };

    it('rejects updating a cart item that belongs to a different table session', async () => {
      cartRepository.findCartItemById.mockResolvedValue(
        otherTablesCartItem as never,
      );

      await expect(
        service.updateItem(sessionMember, 'cart-item-1', {
          quantity: 5,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects removing a cart item that belongs to a different table session', async () => {
      cartRepository.findCartItemById.mockResolvedValue(
        otherTablesCartItem as never,
      );

      await expect(
        service.removeItem(sessionMember, 'cart-item-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFoundException for a cart item that does not exist', async () => {
      cartRepository.findCartItemById.mockResolvedValue(null);

      await expect(
        service.removeItem(sessionMember, 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
