import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify/types/instance";
import RestaurantService from "../../services/restaurant.service.js";
import {
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  RestaurantResponseSchema,
  type CreateRestaurantRequest,
  type UpdateRestaurantRequest,
} from "../../schemas/restaurant.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const restaurantRoutes = async (app: FastifyInstance) => {
  const restaurantService = new RestaurantService(app.prisma);
  const {
    getAllRestaurants,
    createRestaurant,
    getMyRestaurant,
    updateRestaurant,
  } = restaurantService;

  app.get("/", async (request, reply) => {
    // @ts-ignore
    const restaurants = await getAllRestaurants({});
    return reply.status(200).send(restaurants);
  });

  app.post<{ Body: CreateRestaurantRequest }>(
    "/",
    {
      schema: {
        body: CreateRestaurantSchema,
        response: {
          201: Type.Object({ id: Type.String() }),
        },
      },
      onRequest: [app.authorize(["RESTAURANT", "ADMIN"])],
    },
    async (request, reply) => {
      const result = await createRestaurant(request.user.id, request.body);
      return reply.status(201).send(result);
    },
  );

  app.get(
    "/me",
    {
      schema: {
        response: {
          200: RestaurantResponseSchema,
        },
      },
      onRequest: [app.authorize(["RESTAURANT"])], // Seul le rôle RESTAURANT peut accéder
    },
    async (request, reply) => {
      const restaurant = await getMyRestaurant(request.user.id);
      return reply.status(200).send(restaurant);
    },
  );

  app.patch<{ Body: UpdateRestaurantRequest }>(
    "/me",
    {
      schema: {
        body: UpdateRestaurantSchema,
        response: {
          200: RestaurantResponseSchema,
        },
      },
      onRequest: [app.authorize(["RESTAURANT"])], // Propriétaire uniquement
    },
    async (request, reply) => {
      const updated = await updateRestaurant(request.user.id, request.body);
      return reply.status(200).send(updated);
    },
  );
};
