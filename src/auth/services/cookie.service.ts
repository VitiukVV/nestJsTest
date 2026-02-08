import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, CookieOptions } from 'express';
import { parseToMs } from '../utils/time.util';

type TokenType = 'access' | 'refresh';

@Injectable()
export class CookieService {
  private readonly isProduction: boolean;

  private readonly cookieNames: Record<TokenType, string> = {
    access: 'accessToken',
    refresh: 'refreshToken',
  };

  private readonly defaultExpiresIn: Record<TokenType, string> = {
    access: '15m',
    refresh: '30d',
  };

  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  /* ===================== PUBLIC API ===================== */

  setTokenCookie(res: Response, type: TokenType, token: string): void {
    res.cookie(
      this.cookieNames[type],
      token,
      this.buildCookieOptions(this.getMaxAge(type)),
    );
  }

  clearTokenCookie(res: Response, type: TokenType): void {
    res.clearCookie(this.cookieNames[type], this.buildCookieOptions());
  }

  clearAllAuthCookies(res: Response): void {
    this.clearTokenCookie(res, 'access');
    this.clearTokenCookie(res, 'refresh');
  }

  /* ===================== INTERNAL ===================== */

  private buildCookieOptions(maxAge?: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    };
  }

  private getMaxAge(type: TokenType): number {
    const key =
      type === 'access' ? 'JWT_ACCESS_EXPIRES_IN' : 'JWT_REFRESH_EXPIRES_IN';

    const expiresIn =
      this.configService.get<string>(key) ?? this.defaultExpiresIn[type];

    return parseToMs(expiresIn);
  }
}
