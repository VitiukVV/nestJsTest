import { CreateRestaurantDto } from './dto/restaurant.dto';
import { RestaurantService } from './restaurant.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Restaurant } from './schema/restaurant.schema';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Post()
  createRestaurant(@Body() body: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurantService.createRestaurant(body);
  }

  @Get()
  getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAllRestaurants();
  }

  @Get(':id')
  getRestaurantById(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantService.getRestaurantById(id);
  }

  @Delete(':id')
  async deleteRestaurantById(@Param('id') id: string) {
    return this.restaurantService.deleteRestaurantById(id);
  }

  @Put(':id')
  async updateRestaurantById(
    @Param('id') id: string,
    @Body() body: Partial<CreateRestaurantDto>,
  ) {
    return this.restaurantService.updateRestaurantById(id, body);
  }
}
