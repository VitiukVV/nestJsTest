import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class UserCreateDto {
  @IsEmail()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
  })
  name?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @ApiProperty({
    description:
      'User password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'Password123',
    minLength: 8,
  })
  password: string;
}
