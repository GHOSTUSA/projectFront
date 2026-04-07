import type { PrismaClient, OrderStatus } from "../generated/prisma/client.js";
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from "../common/exceptions.js";
import { CreateOrderRequest } from "../schemas/order.schema.js";

export default class OrderService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createOrder = async (userId: string, data: CreateOrderRequest) => {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    let totalPrice = 0;
    const orderItemsToCreate = [];

    const dishIds = data.items.map((item) => item.dishId);
    const uniqueDishIds = [...new Set(dishIds)];
    const dishes = await this.prisma.dish.findMany({
      where: { id: { in: uniqueDishIds }, restaurantId: data.restaurantId },
    });

    if (dishes.length !== uniqueDishIds.length) {
      throw new BadRequestError(
        "Un ou plusieurs plats n'existent pas ou n'appartiennent pas à ce restaurant",
      );
    }

    const dishMap = new Map(dishes.map((d) => [d.id, d.price]));

    for (const item of data.items) {
      const price = dishMap.get(item.dishId);
      if (price === undefined) {
        throw new BadRequestError(`Dish not found: ${item.dishId}`);
      }

      totalPrice += price * item.quantity;
      orderItemsToCreate.push({
        dishId: item.dishId,
        quantity: item.quantity,
        price: price,
      });
    }

    return await this.prisma.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        totalPrice,
        status: "PENDING",
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        items: {
          include: {
            dish: true,
          },
        },
      },
    });
  };

  getOrderById = async (
    id: string,
    userId: string,
    userRole: string,
    restaurantId?: string,
  ) => {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            dish: true,
          },
        },
        restaurant: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (userRole !== "ADMIN") {
      const isOwner = order.userId === userId;
      const isRestaurant = order.restaurantId === restaurantId;

      if (!isOwner && !isRestaurant) {
        throw new UnauthorizedError(
          "You are not authorized to view this order",
        );
      }
    }

    return order;
  };

  getUserOrders = async (userId: string) => {
    return await this.prisma.order.findMany({
      where: { userId },
      include: {
        restaurant: true,
        items: {
          include: { dish: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  getRestaurantOrders = async (restaurantId: string) => {
    return await this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: { id: true, email: true },
        },
        items: {
          include: { dish: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  updateOrderStatus = async (
    id: string,
    restaurantId: string,
    newStatus: OrderStatus,
  ) => {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.restaurantId !== restaurantId) {
      throw new UnauthorizedError(
        "You are not authorized to update this order's status",
      );
    }

    const statusFlow: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    const validNextStatuses = statusFlow[order.status] || [];

    if (!validNextStatuses.includes(newStatus as string)) {
      throw new BadRequestError(
        `Invalid status transition from ${order.status} to ${newStatus}`,
      );
    }

    return await this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
  };

  cancelOrder = async (id: string, userId: string) => {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.userId !== userId) {
      throw new UnauthorizedError(
        "You are not authorized to cancel this order",
      );
    }

    if (order.status !== "PENDING") {
      throw new BadRequestError(
        `Order cannot be cancelled in current status: ${order.status}`,
      );
    }

    return await this.prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  };
}
