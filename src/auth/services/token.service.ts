import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { parseToMs } from '../utils/time.util';

export interface TokenPayload {
  sub: string;
  iss?: string;
  aud?: string;
}

@Injectable()
export class TokenService {
  private readonly refreshJwtService: JwtService;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('JWT_REFRESH_MODULE')
    refreshJwtService: JwtService,
  ) {
    this.refreshJwtService = refreshJwtService;
    this.issuer = this.configService.get<string>('JWT_ISSUER', 'nestJsTest');
    this.audience = this.configService.get<string>(
      'JWT_AUDIENCE',
      'nestJsTest-api',
    );
  }

  /**
   * Signs an access token for the given user ID.
   */
  signAccessToken(userId: string): string {
    const expiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );

    const payload: TokenPayload = {
      sub: userId,
      iss: this.issuer,
      aud: this.audience,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: (expiresIn || '15m') as StringValue,
    });
  }

  /**
   * Signs a refresh token for the given user ID.
   */
  signRefreshToken(userId: string): string {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '30d',
    );

    const payload: TokenPayload = {
      sub: userId,
      iss: this.issuer,
      aud: this.audience,
    };

    return this.refreshJwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (expiresIn || '30d') as StringValue,
    });
  }

  /**
   * Verifies a refresh token and returns the decoded payload.
   * Throws if the token is invalid or expired.
   */
  verifyRefreshToken(token: string): TokenPayload {
    return this.refreshJwtService.verify<TokenPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * Calculates the expiration date for a refresh token based on expiresIn string.
   */
  calculateRefreshTokenExpiration(): Date {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '30d',
    );
    const expiresInMs = parseToMs(expiresIn);
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);
    return expiresAt;
  }
}
