import { EnvVariable } from '@/config/env.validation';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';

export type VerifiedLineProfile = {
  lineUserId: string;
  name?: string;
  picture?: string;
};

type LineVerifyResponse = {
  sub: string;
  aud: string;
  name?: string;
  picture?: string;
};

/** Verifies a LIFF ID token against LINE's own servers so the caller's
 *  identity (`sub`) can never be spoofed by a self-reported request field. */
@Injectable()
export class LineAuthService {
  constructor(
    private readonly configService: ConfigService<EnvVariable, true>,
  ) {}

  async verifyIdToken(idToken: string): Promise<VerifiedLineProfile> {
    const clientId = this.configService.get('LINE_CHANNEL_ID', {
      infer: true,
    });

    const response = await fetch(LINE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid or expired LINE login session');
    }

    const payload = (await response.json()) as LineVerifyResponse;

    if (payload.aud !== clientId || !payload.sub) {
      throw new UnauthorizedException('Invalid or expired LINE login session');
    }

    return {
      lineUserId: payload.sub,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
