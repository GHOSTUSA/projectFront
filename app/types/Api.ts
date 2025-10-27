/**
 * Types pour les réponses API et les requêtes
 * Garantit un typage strict des communications avec le serveur
 */

import type { Restaurant } from "./Restaurant";
import type { User } from "./User";
import type { Command } from "./Command";

/**
 * Structure générique pour les réponses API standardisées
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * Structure pour les erreurs API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Réponse de l'API pour les données statiques
 */
export interface DataApiResponse {
  restaurants: Restaurant[];
  users: User[];
  commands: Command[];
}

/**
 * Types pour l'authentification
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse
  extends ApiResponse<{
    user: User;
    token?: string;
  }> {}

/**
 * Types pour les requêtes de création
 */
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

/**
 * Utility types pour la manipulation des données
 */
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

/**
 * Types spécialisés pour les entités
 */
export type UserWithoutPassword = Omit<User, "password">;
export type RestaurantSummary = Pick<
  Restaurant,
  "id" | "name" | "cuisineType" | "averageRating"
>;
export type DishSummary = Pick<import("./Dish").Dish, "id" | "name" | "price">;

/**
 * Types pour les états de chargement
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T = any> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}
