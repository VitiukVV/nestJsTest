import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './token.service';
import { createHash } from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Creates a hash of the refresh token using SHA-256.
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Creates a new refresh token record in the database.
   * Stores only the hash of the token, never the plain text.
   */
  async create(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = this.tokenService.calculateRefreshTokenExpiration();

    await this.prismaService.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Finds a refresh token record by its hash.
   */
  async findByHash(tokenHash: string) {
    return this.prismaService.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  /**
   * Finds a refresh token record by the plain token (hashes it first).
   */
  async findByToken(token: string) {
    const tokenHash = this.hashToken(token);
    return this.findByHash(tokenHash);
  }

  /**
   * Rotates a refresh token: revokes the old one and creates a new one atomically.
   * Uses a database transaction to ensure consistency.
   */
  async rotate(
    oldToken: string,
    userId: string,
    newRefreshToken: string,
  ): Promise<void> {
    const oldTokenHash = this.hashToken(oldToken);
    const newTokenHash = this.hashToken(newRefreshToken);
    const expiresAt = this.tokenService.calculateRefreshTokenExpiration();

    await this.prismaService.$transaction(async (tx) => {
      // Revoke the old token
      await tx.refreshToken.updateMany({
        where: { tokenHash: oldTokenHash },
        data: { revoked: true },
      });

      // Create the new token
      await tx.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          userId,
          expiresAt,
        },
      });
    });
  }

  /**
   * Revokes a refresh token by marking it as revoked.
   */
  async revoke(tokenHash: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  /**
   * Revokes a refresh token by the plain token (hashes it first).
   */
  async revokeByToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.revoke(tokenHash);
  }

  /**
   * Revokes all refresh tokens for a specific user.
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  /**
   * Validates a refresh token: checks if it exists, is not revoked, and not expired.
   * Throws UnauthorizedException if validation fails.
   */
  async validateToken(tokenHash: string): Promise<void> {
    const tokenRecord = await this.findByHash(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!tokenRecord.user) {
      throw new UnauthorizedException('User not found for refresh token');
    }
  }
}
