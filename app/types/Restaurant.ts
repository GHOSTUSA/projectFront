import type { Dish } from "./Dish";

export type Restaurant = {
  id: number;
  name: string;
  address: string;
  phone: string;
  cuisineType: string;
  averageRating: number;
  image: string;
  dishes: Dish[];
};
