/** Types TypeScript - Plats et panier */
export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  allergens: string[];
  restaurantId?: number;
}

export type DishSummary = Pick<Dish, "id" | "name" | "price" | "image">;

export type CreateDishData = Omit<Dish, "id">;

export type UpdateDishData = Partial<Omit<Dish, "id">> & { id: number };

export interface CartItem extends Dish {
  quantity: number;
  totalPrice: number;
}
