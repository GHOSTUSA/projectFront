/** Types TypeScript - Utilisateur et authentification */
import type { Command } from "./Command";

export interface User {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: "admin" | "user" | "restaurateur";
  restaurantId?: number;
  createdAt: string;
  commands?: Command[];
}

export type PublicUser = Omit<User, "password">;
export type CreateUserData = Omit<User, "id" | "createdAt" | "commands">;
export type UpdateUserData = Partial<Omit<User, "id">> & { id: number };
