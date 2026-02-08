import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
        JWT_ISSUER: Joi.string().default('nestJsTest'),
        JWT_AUDIENCE: Joi.string().default('nestJsTest-api'),
        COOKIE_SECRET: Joi.string().optional(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        FRONTEND_URL: Joi.string().uri().optional(),
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DB_HOST'),
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    RestaurantModule,

    PrismaModule,

    UsersModule,

    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
