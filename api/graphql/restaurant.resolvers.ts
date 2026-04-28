import type { IResolvers } from "mercurius";
import type { FastifyInstance } from "fastify";
import { NotFoundError } from "../common/exceptions.js";
import RestaurantService from "../services/restaurant.service.js";

export const createRestaurantResolvers = (app: FastifyInstance): IResolvers => {
  const restaurantService = new RestaurantService(app.prisma);

  return {
    Query: {
      restaurants: async () => {
        const result = await restaurantService.getAllRestaurants();
        return result.restaurants;
      },
      restaurant: async (_, { id }: { id: string }) => {
        const restaurant = await app.prisma.restaurant.findUnique({
          where: { id },
        });
        if (!restaurant) {
          throw new NotFoundError("Restaurant not found");
        }
        return restaurant;
      },
    },
    Restaurant: {
      dishes: async (parent: any) => {
        return await app.prisma.dish.findMany({
          where: { restaurantId: parent.id },
        });
      },
      orders: async (parent: any, _, context: any) => {
        // Authentification supportée: on ne retourne les commandes que si c'est ADMIN ou le RESTAURANT proriétaire
        if (!context.user) return [];
        const user = context.user;
        if (
          user.role === "ADMIN" ||
          (user.role === "RESTAURANT" && parent.userId === user.id)
        ) {
          return await app.prisma.order.findMany({
            where: { restaurantId: parent.id },
            include: { items: true },
          });
        }
        return [];
      },
    },
    Order: {
      createdAt: (parent: any) => parent.createdAt.toISOString(),
      updatedAt: (parent: any) => parent.updatedAt.toISOString(),
    },
  };
};
