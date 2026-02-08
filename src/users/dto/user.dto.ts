import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
