import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Request, Response } from 'express';
import { User } from '../users/entities/user.entity';
import { getJwt } from './jwt';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: User, response: Response) {
    const expires = new Date();
    const expirationSeconds = Number(
      this.configService.getOrThrow('JWT_EXPIRATION'),
    );
    expires.setSeconds(expires.getSeconds() + expirationSeconds);

    const tokenPayload: TokenPayload = {
      ...user,
      _id: user._id.toHexString(),
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, this.cookieOptions(expires));

    return token;
  }

  verifyWs(request: Request, connectionParams: { token?: string } = {}) {
    const cookies: string[] | undefined = request.headers.cookie?.split('; ');
    const authCookie = cookies?.find((cookie) =>
      cookie.includes('Authentication'),
    );
    const jwt = authCookie?.split('Authentication=')[1];
    return this.jwtService.verify<TokenPayload>(
      jwt || getJwt(connectionParams.token) || '',
    );
  }

  logout(response: Response) {
    response.cookie('Authentication', '', this.cookieOptions(new Date()));
  }

  private cookieOptions(expires: Date): CookieOptions {
    const secure = this.isCookieSecure();
    return {
      httpOnly: true,
      expires,
      secure,
      // Required for Vercel (frontend) ↔ Koyeb (API) cross-site cookies
      sameSite: secure ? 'none' : 'lax',
      path: '/',
    };
  }

  private isCookieSecure() {
    const configured = this.configService.get<string>('COOKIE_SECURE');
    if (configured != null) {
      return configured === 'true';
    }
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
