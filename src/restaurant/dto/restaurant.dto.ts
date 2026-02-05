import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum PriceRange {
  ONE = '$',
  TWO = '$$',
  THREE = '$$$',
  FOUR = '$$$$',
}

export class ContactDto {
  @IsString()
  @ApiProperty({
    description: 'Contact phone number',
    example: '+380501234567',
  })
  phone: string;

  @IsEmail()
  @ApiProperty({
    description: 'Contact email address',
    example: 'restaurant@example.com',
  })
  email: string;
}

export class AddressDto {
  @IsString()
  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  street: string;

  @IsString()
  @ApiProperty({
    description: 'City name',
    example: 'Kyiv',
  })
  city: string;

  @IsString()
  @ApiProperty({
    description: 'State or province',
    example: 'Kyiv Oblast',
  })
  state: string;

  @IsString()
  @ApiProperty({
    description: 'Country name',
    example: 'Ukraine',
  })
  country: string;

  @IsString()
  @ApiProperty({
    description: 'Postal or ZIP code',
    example: '01001',
  })
  postalCode: string;
}

export class LocationDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 50.4501,
    type: Number,
  })
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Longitude coordinate',
    example: 30.5234,
    type: Number,
  })
  lng: number;
}

export class CreateRestaurantDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the restaurant',
    example: 'Pizza Palace',
  })
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'List of cuisine types',
    example: ['Italian', 'Pizza'],
    type: [String],
  })
  cuisine: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Restaurant rating (0-5)',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Number of reviews',
    example: 150,
    minimum: 0,
  })
  reviewsCount?: number;

  @IsEnum(PriceRange)
  @ApiProperty({
    description: 'Price range indicator',
    example: PriceRange.TWO,
    enum: PriceRange,
  })
  priceRange: PriceRange;

  @ValidateNested()
  @Type(() => ContactDto)
  @ApiProperty({
    description: 'Contact information',
    type: ContactDto,
  })
  contact: ContactDto;

  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty({
    description: 'Restaurant address',
    type: AddressDto,
  })
  address: AddressDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @ApiProperty({
    description: 'Geographic location coordinates',
    type: LocationDto,
  })
  location: LocationDto;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether the restaurant is currently open',
    example: true,
    default: true,
  })
  isOpen?: boolean;
}
