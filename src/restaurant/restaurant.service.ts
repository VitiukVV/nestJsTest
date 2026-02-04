import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRestaurantDto } from './dto/restaurant.dto';
import { Restaurant } from './schema/restaurant.schema';
@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  async createRestaurant(data: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = new this.restaurantModel(data);
    return restaurant.save();
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  async getRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async deleteRestaurantById(id: string): Promise<Restaurant> {
    const deleted = await this.restaurantModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Restaurant not found');
    return deleted;
  }

  async updateRestaurantById(
    id: string,
    data: Partial<CreateRestaurantDto>,
  ): Promise<Restaurant> {
    const updated = await this.restaurantModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new NotFoundException('Restaurant not found');
    return updated;
  }
}
