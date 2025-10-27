import type { Command } from "./Command";

export type User = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: "admin" | "user" | "restaurateur";
  restaurantId?: number; // Pour les restaurateurs
  createdAt: string;
  commands?: Command[];
};
