/** Types TypeScript - Réponses API et requêtes avec typage strict */

import type { Restaurant } from "./Restaurant";
import type { User } from "./User";
import type { Command } from "./Command";

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface DataApiResponse {
  restaurants: Restaurant[];
  users: User[];
  commands: Command[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse
  extends ApiResponse<{
    user: User;
    token?: string;
  }> {}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: User["role"];
  restaurantId?: number;
}

export interface CreateCommandRequest {
  items: Array<{
    dishId: number;
    quantity: number;
  }>;
  restaurantId: number;
  userId: number;
}

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type UserWithoutPassword = Omit<User, "password">;
export type RestaurantSummary = Pick<
  Restaurant,
  "id" | "name" | "cuisineType" | "averageRating"
>;
export type DishSummary = Pick<import("./Dish").Dish, "id" | "name" | "price">;

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T = any> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}
