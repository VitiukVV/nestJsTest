import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateRestaurantDto } from './dto/restaurant.dto';
import { UpdateRestaurantDto } from './dto/updateRestaurant.dto';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './schema/restaurant.schema';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({
    status: 201,
    description: 'The restaurant has been successfully created.',
  })
  @ApiBody({ type: CreateRestaurantDto })
  createRestaurant(@Body() body: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurantService.createRestaurant(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({
    status: 200,
    description: 'The restaurants have been successfully retrieved.',
  })
  getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAllRestaurants();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the restaurant',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The restaurant has been successfully retrieved.',
  })
  getRestaurantById(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantService.getRestaurantById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a restaurant by ID' })
  @ApiResponse({
    status: 204,
    description: 'The restaurant has been successfully deleted.',
  })
  async deleteRestaurantById(@Param('id') id: string): Promise<void> {
    await this.restaurantService.deleteRestaurantById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the restaurant',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The restaurant has been successfully updated.',
  })
  @ApiBody({ type: UpdateRestaurantDto })
  async updateRestaurantById(
    @Param('id') id: string,
    @Body() body: UpdateRestaurantDto,
  ) {
    return this.restaurantService.updateRestaurantById(id, body);
  }
}
