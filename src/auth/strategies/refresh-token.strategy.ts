import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RefreshTokenService } from '../services/refresh-token.service';
import { CurrentUserType } from '../decorators/user.decorator';

/**
 * Extracts refresh token from cookies.
 * Shared extractor function to avoid duplication.
 */
const extractRefreshTokenFromCookie = (request: Request): string | null => {
  return (request?.cookies?.refreshToken as string | undefined) ?? null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
  ) {
    const issuer = configService.get<string>('JWT_ISSUER', 'nestJsTest');
    const audience = configService.get<string>(
      'JWT_AUDIENCE',
      'nestJsTest-api',
    );

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractRefreshTokenFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      issuer,
      audience,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { sub: string },
  ): Promise<CurrentUserType> {
    const refreshToken = extractRefreshTokenFromCookie(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // findByToken hashes the token internally before lookup
    const tokenRecord =
      await this.refreshTokenService.findByToken(refreshToken);

    if (
      !tokenRecord ||
      tokenRecord.revoked ||
      tokenRecord.expiresAt < new Date() ||
      !tokenRecord.user
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify the user ID from the token matches the database record
    // Type assertion is safe here because we've already checked !tokenRecord.user above
    // We assert to CurrentUserType to ensure we're not returning the full Prisma entity
    const user = tokenRecord.user as CurrentUserType;
    if (user.id !== payload.sub) {
      throw new UnauthorizedException('Token user mismatch');
    }

    // Return only CurrentUserType fields, not the full Prisma entity
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
