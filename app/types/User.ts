import type { Command } from "./Command";

export type User = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  commands?: Command[];
};
