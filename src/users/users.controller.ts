import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserType,
} from '../auth/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: UserCreateDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() userCreateDto: UserCreateDto): Promise<UserDto> {
    return this.usersService.create(userCreateDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMe(@CurrentUser() user: CurrentUserType): Promise<UserDto> {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UserUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateMe(
    @CurrentUser() user: CurrentUserType,
    @Body() userUpdateDto: UserUpdateDto,
  ): Promise<UserDto> {
    return this.usersService.update(user.id, userUpdateDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({
    status: 204,
    description: 'User account deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteMe(@CurrentUser() user: CurrentUserType): Promise<void> {
    return this.usersService.delete(user.id);
  }
}
