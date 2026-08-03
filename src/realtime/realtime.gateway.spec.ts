import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { SessionMemberRepositoryInterface } from '@/session-member/session-member.repository.interface';

function makeMockSocket() {
  return {
    handshake: { auth: {} as { token?: string } },
    join: jest.fn(),
    emit: jest.fn(),
  };
}

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let jwtService: jest.Mocked<JwtService>;
  let sessionMemberRepository: jest.Mocked<SessionMemberRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: JwtService, useValue: { verify: jest.fn() } },
        {
          provide: SessionMemberRepositoryInterface,
          useValue: { findByToken: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get(RealtimeGateway);
    jwtService = module.get(JwtService);
    sessionMemberRepository = module.get(SessionMemberRepositoryInterface);
  });

  describe('handleJoin (customer table-session room)', () => {
    it('rejects a connection with no token at all', async () => {
      const client = makeMockSocket();

      await gateway.handleJoin(client as never, 'table-session-1');

      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('rejects a token that does not resolve to any session member', async () => {
      const client = makeMockSocket();
      client.handshake.auth.token = 'bad-token';
      sessionMemberRepository.findByToken.mockResolvedValue(null);

      await gateway.handleJoin(client as never, 'table-session-1');

      expect(client.join).not.toHaveBeenCalled();
    });

    it('rejects joining a DIFFERENT table session than the one the token belongs to (IDOR prevention)', async () => {
      const client = makeMockSocket();
      client.handshake.auth.token = 'valid-token-for-table-1';
      sessionMemberRepository.findByToken.mockResolvedValue({
        id: 'member-1',
        tableSessionId: 'table-session-1',
      } as never);

      await gateway.handleJoin(client as never, 'table-session-2');

      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('joins the room when the token legitimately belongs to the requested table session', async () => {
      const client = makeMockSocket();
      client.handshake.auth.token = 'valid-token';
      sessionMemberRepository.findByToken.mockResolvedValue({
        id: 'member-1',
        tableSessionId: 'table-session-1',
      } as never);

      await gateway.handleJoin(client as never, 'table-session-1');

      expect(client.join).toHaveBeenCalledWith('table-session:table-session-1');
    });
  });

  describe('handleJoinAdmin (admin broadcast room)', () => {
    it('rejects a connection with no token at all', () => {
      const client = makeMockSocket();

      gateway.handleJoinAdmin(client as never);

      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('rejects an invalid/expired staff JWT', () => {
      const client = makeMockSocket();
      client.handshake.auth.token = 'garbage';
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      gateway.handleJoinAdmin(client as never);

      expect(client.join).not.toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('joins the admin room for any valid staff JWT, regardless of role', () => {
      const client = makeMockSocket();
      client.handshake.auth.token = 'valid-staff-jwt';
      jwtService.verify.mockReturnValue({
        sub: 'staff-1',
        role: 'STAFF',
      });

      gateway.handleJoinAdmin(client as never);

      expect(client.join).toHaveBeenCalledWith('admin');
    });
  });
});
