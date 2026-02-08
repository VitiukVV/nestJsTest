import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { TokenService } from './services/token.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { CurrentUserType } from './decorators/user.decorator';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user: CurrentUserType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<CurrentUserType | null> {
    return this.usersService.validate(email, password);
  }

  /**
   * Generates a new access and refresh token pair for a user.
   */
  async generateTokens(user: CurrentUserType): Promise<TokenPair> {
    const accessToken = this.tokenService.signAccessToken(user.id);
    const refreshToken = this.tokenService.signRefreshToken(user.id);

    await this.refreshTokenService.create(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  /**
   * Refreshes an access token using a valid refresh token.
   * Implements token rotation: revokes the old refresh token and issues a new one.
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let tokenHash: string;

    try {
      // Verify the JWT token structure and signature
      this.tokenService.verifyRefreshToken(refreshToken);
      tokenHash = this.refreshTokenService.hashToken(refreshToken);
    } catch (error) {
      if (
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      // Re-throw infrastructure errors (database, network, etc.)
      throw error;
    }

    // Validate the token in the database
    try {
      await this.refreshTokenService.validateToken(tokenHash);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Re-throw infrastructure errors
      throw error;
    }

    // Get the user
    const tokenRecord = await this.refreshTokenService.findByHash(tokenHash);
    if (!tokenRecord?.user) {
      throw new UnauthorizedException('User not found for refresh token');
    }

    // Type assertion is safe here because we've already checked !tokenRecord.user above
    const user = tokenRecord.user as CurrentUserType;

    // Generate new tokens
    const newAccessToken = this.tokenService.signAccessToken(user.id);
    const newRefreshToken = this.tokenService.signRefreshToken(user.id);

    // Rotate tokens atomically
    await this.refreshTokenService.rotate(
      refreshToken,
      user.id,
      newRefreshToken,
    );

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Revokes a refresh token.
   */
  async revokeRefreshToken(token: string): Promise<void> {
    if (token) {
      await this.refreshTokenService.revokeByToken(token);
    }
  }

  /**
   * Revokes all refresh tokens for a user.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllForUser(userId);
  }

  /**
   * Login: generates tokens for an authenticated user.
   */
  async login(user: CurrentUserType): Promise<TokenPair> {
    return this.generateTokens(user);
  }

  /**
   * Logout: revokes the provided refresh token.
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }
    return { message: 'Successfully logged out' };
  }
}
