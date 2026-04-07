import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify/types/instance";
import OrderService from "../../services/orders.service.js";
import RestaurantService from "../../services/restaurant.service.js";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "../../schemas/order.schema.js";

const orderRoutes = async (app: FastifyInstance) => {
  const orderService = new OrderService(app.prisma);
  const restaurantService = new RestaurantService(app.prisma);

  app.post<{ Body: CreateOrderRequest }>(
    "/",
    {
      schema: {
        body: CreateOrderSchema.body,
        response: {
          201: Type.Any(),
        },
      },
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const order = await orderService.createOrder(
        request.user.id,
        request.body,
      );
      return reply.status(201).send(order);
    },
  );

  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const orders = await orderService.getUserOrders(request.user.id);
      return reply.status(200).send(orders);
    },
  );

  app.get(
    "/restaurant",
    {
      onRequest: [app.authorize(["RESTAURANT", "ADMIN"])],
    },
    async (request, reply) => {
      const restaurant = await restaurantService.getMyRestaurant(
        request.user.id,
      );
      const orders = await orderService.getRestaurantOrders(restaurant.id);
      return reply.status(200).send(orders);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
      },
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      let restaurantId = undefined;
      try {
        if (request.user.role === "RESTAURANT") {
          const rest = await restaurantService.getMyRestaurant(request.user.id);
          restaurantId = rest.id;
        }
      } catch (e) {}

      const order = await orderService.getOrderById(
        request.params.id,
        request.user.id,
        request.user.role,
        restaurantId,
      );
      return reply.status(200).send(order);
    },
  );

  app.patch<{ Params: { id: string }; Body: UpdateOrderStatusRequest }>(
    "/:id/status",
    {
      schema: {
        params: UpdateOrderStatusSchema.params,
        body: UpdateOrderStatusSchema.body,
        response: {
          200: Type.Any(),
        },
      },
      onRequest: [app.authorize(["RESTAURANT", "ADMIN"])],
    },
    async (request, reply) => {
      const restaurant = await restaurantService.getMyRestaurant(
        request.user.id,
      );
      const updated = await orderService.updateOrderStatus(
        request.params.id,
        restaurant.id,
        request.body.status as
          | "PENDING"
          | "CONFIRMED"
          | "PREPARING"
          | "READY"
          | "DELIVERED"
          | "CANCELLED",
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
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      await orderService.cancelOrder(request.params.id, request.user.id);
      return reply.status(204).send();
    },
  );
};

export default orderRoutes;
