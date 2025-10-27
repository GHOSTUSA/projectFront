export type Dish = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  allergens: string[];
  restaurantId?: number; // ID du restaurant d'origine
};
