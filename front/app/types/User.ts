/* Types TypeScript pour les utilisateurs et l'authentification */
import type { Command } from "./Command";

export interface User {
  id: string | number;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: "admin" | "user" | "restaurateur";
  restaurantId?: string | number;
  createdAt: string;
  commands?: Command[];
}

export type PublicUser = Omit<User, "password">;
export type CreateUserData = Omit<User, "id" | "createdAt" | "commands">;
export type UpdateUserData = Partial<Omit<User, "id">> & {
  id: string | number;
};
