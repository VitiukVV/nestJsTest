import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [String], required: true })
  cuisine: string[];

  @Prop({ min: 0, max: 5, default: 0 })
  rating: number;

  @Prop({ min: 0, default: 0 })
  reviewsCount: number;

  @Prop({ required: true })
  priceRange: string;

  @Prop({
    type: {
      phone: { type: String },
      email: { type: String },
    },
    _id: false,
  })
  contact: {
    phone: string;
    email: string;
  };

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    _id: false,
  })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Prop({
    type: {
      lat: Number,
      lng: Number,
    },
    _id: false,
  })
  location: {
    lat: number;
    lng: number;
  };

  @Prop({ default: true })
  isOpen: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
