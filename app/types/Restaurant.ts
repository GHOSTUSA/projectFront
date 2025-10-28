/** Types TypeScript - Restaurant et informations commerciales */
import type { Dish } from "./Dish";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  cuisineType: string;
  averageRating: number;
  image: string;
  dishes: Dish[];
}

export type RestaurantSummary = Pick<
  Restaurant,
  "id" | "name" | "cuisineType" | "averageRating" | "image"
>;

export type CreateRestaurantData = Omit<Restaurant, "id" | "dishes"> & {
  dishes?: Dish[];
};

export type UpdateRestaurantData = Partial<Omit<Restaurant, "id">> & {
  id: number;
};
