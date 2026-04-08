import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth/index.js";
import { restaurantRoutes } from "./restaurant/index.js";
import dishRoutes from "./dishes/index.js";
import orderRoutes from "./orders/index.js";
import userRoutes from "./users/index.js";
import { websocketRoutes } from "./websocket.js";

export const registerRoutes = async (app: FastifyInstance) => {
  await app.register(
    async (fastify) => {
      await fastify.register(authRoutes, { prefix: "/auth" });
      await fastify.register(userRoutes, { prefix: "/users" });
      await fastify.register(restaurantRoutes, { prefix: "/restaurants" });
      await fastify.register(dishRoutes, { prefix: "/dishes" });
      await fastify.register(orderRoutes, { prefix: "/orders" });
      await fastify.register(websocketRoutes);
    },
    { prefix: "/api" },
  );
};
