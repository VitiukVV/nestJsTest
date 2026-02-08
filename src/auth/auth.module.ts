import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { CookieService } from './services/cookie.service';
import { TokenService } from './services/token.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_EXPIRES_IN') ||
            '15m') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    RefreshTokenService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    CookieService,
    {
      provide: 'JWT_REFRESH_MODULE',
      useFactory: (configService: ConfigService) => {
        return new JwtService({
          secret: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          signOptions: {
            expiresIn: (configService.get<string>(
              'JWT_REFRESH_EXPIRES_IN',
              '30d',
            ) || '30d') as StringValue,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, CookieService],
})
export class AuthModule {}
