import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth/index.js";
import { restaurantRoutes } from "./restaurant/index.js";

export const registerRoutes = async (app: FastifyInstance) => {
  // Routes API
  await app.register(
    async (fastify) => {
      await fastify.register(authRoutes, { prefix: "/auth" });
    },
    { prefix: "/api" },
  );

  await app.register(
    async (fastify) => {
      await fastify.register(restaurantRoutes, { prefix: "/restaurants" });
    },
    { prefix: "/api" },
  );
};
