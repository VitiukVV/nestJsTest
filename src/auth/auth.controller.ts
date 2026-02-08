import { Controller, Post, UseGuards, Res, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CookieService } from './services/cookie.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from './decorators/user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates user and returns access token. Refresh token is automatically set in HttpOnly cookie. Access token is also set in HttpOnly cookie.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(
    @CurrentUser() user: CurrentUserType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(user);
    this.cookieService.setTokenCookie(res, 'refresh', tokens.refresh_token);
    this.cookieService.setTokenCookie(res, 'access', tokens.access_token);
    return {
      access_token: tokens.access_token,
      user: tokens.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Revokes refresh token and clears HttpOnly cookies. Requires valid access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully logged out' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    await this.authService.logout(refreshToken || '');
    this.cookieService.clearAllAuthCookies(res);
    return { message: 'Successfully logged out' };
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard, AuthGuard('refresh-token'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Refreshes the access token using the refresh token from HttpOnly cookie. A new refresh token is issued and stored in cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    const tokens = await this.authService.refreshTokens(refreshToken || '');
    this.cookieService.setTokenCookie(res, 'refresh', tokens.refresh_token);
    this.cookieService.setTokenCookie(res, 'access', tokens.access_token);
    return {
      access_token: tokens.access_token,
      user: tokens.user,
    };
  }
}
