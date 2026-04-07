import type { PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError, UnauthorizedError } from "../common/exceptions.js";

export interface CreateDishInput {
  name: string;
  description: string;
  price: number;
  image: string;
}

export default class DishService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createDish = async (restaurantId: string, data: CreateDishInput) => {
    return await this.prisma.dish.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        restaurantId,
      },
    });
  };

  updateDish = async (
    id: string,
    restaurantId: string,
    data: Partial<CreateDishInput>,
  ) => {
    const dish = await this.prisma.dish.findUnique({ where: { id } });

    if (!dish) {
      throw new NotFoundError("Dish not found");
    }

    if (dish.restaurantId !== restaurantId) {
      throw new UnauthorizedError(
        "Unauthorized: Dish does not belong to your restaurant",
      );
    }

    return await this.prisma.dish.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description:
          data.description !== undefined ? data.description : undefined,
        price: data.price !== undefined ? data.price : undefined,
        image: data.image !== undefined ? data.image : undefined,
      },
    });
  };

  deleteDish = async (id: string, restaurantId: string) => {
    const dish = await this.prisma.dish.findUnique({ where: { id } });

    if (!dish) {
      throw new NotFoundError("Dish not found");
    }

    if (dish.restaurantId !== restaurantId) {
      throw new UnauthorizedError(
        "Unauthorized: Dish does not belong to your restaurant",
      );
    }

    return await this.prisma.dish.delete({
      where: { id },
    });
  };

  getRestaurantDishes = async (restaurantId: string) => {
    return await this.prisma.dish.findMany({
      where: { restaurantId },
    });
  };

  getDishById = async (id: string) => {
    const dish = await this.prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      throw new NotFoundError("Dish not found");
    }
    return dish;
  };
}
