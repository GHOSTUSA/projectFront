import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify/types/instance";
import DishService from "../../services/dish.service.js";
import RestaurantService from "../../services/restaurant.service.js";
import {
  CreateDishSchema,
  UpdateDishSchema,
  CreateDishRequest,
  UpdateDishRequest,
  DishBodySchema,
} from "../../schemas/dish.schema.js";

const dishRoutes = async (app: FastifyInstance) => {
  const dishService = new DishService(app.prisma);
  const restaurantService = new RestaurantService(app.prisma);

  app.post<{ Body: CreateDishRequest }>(
    "/",
    {
      schema: {
        body: CreateDishSchema.body,
        response: {
          201: Type.Object({ id: Type.String() }),
        },
      },
      onRequest: [app.authorize(["RESTAURANT", "ADMIN"])],
    },
    async (request, reply) => {
      const restaurant = await restaurantService.getMyRestaurant(
        request.user.id,
      );

      const dish = await dishService.createDish(restaurant.id, request.body);
      return reply.status(201).send({ id: dish.id });
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateDishRequest }>(
    "/:id",
    {
      schema: {
        params: UpdateDishSchema.params,
        body: UpdateDishSchema.body,
        response: {
          200: Type.Any(), // Simplifié, à typer
        },
      },
      onRequest: [app.authorize(["RESTAURANT", "ADMIN"])],
    },
    async (request, reply) => {
      const restaurant = await restaurantService.getMyRestaurant(
        request.user.id,
      );
      const updated = await dishService.updateDish(
        request.params.id,
        restaurant.id,
        request.body,
      );
      return reply.status(200).send(updated);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
      },
      onRequest: [app.authorize(["RESTAURANT", "ADMIN"])],
    },
    async (request, reply) => {
      const restaurant = await restaurantService.getMyRestaurant(
        request.user.id,
      );
      await dishService.deleteDish(request.params.id, restaurant.id);
      return reply.status(204).send();
    },
  );

  app.get<{ Params: { restaurantId: string } }>(
    "/restaurant/:restaurantId",
    {
      schema: {
        params: Type.Object({ restaurantId: Type.String() }),
      },
    },
    async (request, reply) => {
      const dishes = await dishService.getRestaurantDishes(
        request.params.restaurantId,
      );
      return reply.status(200).send(dishes);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
      },
    },
    async (request, reply) => {
      const dish = await dishService.getDishById(request.params.id);
      return reply.status(200).send(dish);
    },
  );
};

export default dishRoutes;
