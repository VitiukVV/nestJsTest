import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  AddressDto,
  ContactDto,
  CreateRestaurantDto,
  LocationDto,
} from './restaurant.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContactDto extends PartialType(ContactDto) {}

export class UpdateAddressDto extends PartialType(AddressDto) {}

export class UpdateLocationDto extends PartialType(LocationDto) {}

export class UpdateRestaurantDto extends PartialType(
  OmitType(CreateRestaurantDto, ['contact', 'address', 'location'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContactDto)
  @ApiPropertyOptional({
    description: 'Contact information',
    type: UpdateContactDto,
  })
  contact?: UpdateContactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  @ApiPropertyOptional({
    description: 'Restaurant address',
    type: UpdateAddressDto,
  })
  address?: UpdateAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLocationDto)
  @ApiPropertyOptional({
    description: 'Geographic location coordinates',
    type: UpdateLocationDto,
  })
  location?: UpdateLocationDto;
}
