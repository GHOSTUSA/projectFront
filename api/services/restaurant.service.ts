import type { PrismaClient } from "../generated/prisma/client.js";
import { hash, compare } from "bcryptjs";
import { ConflictError, UnauthorizedError } from "../common/exceptions.js";

export interface CreateRestaurantInput {
  name: string;
  address: string;
  phoneNumber: string;
  picture?: string;
}

export default class RestaurantService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  getAllRestaurants = async (): Promise<{ restaurants: any[] }> => {
    const restaurants = await this.prisma.restaurant.findMany();

    return {
      restaurants: restaurants,
    };
  };

  createRestaurant = async (
    userId: string,
    input: CreateRestaurantInput,
  ): Promise<{ id: string }> => {
    // Vérifier si l'utilisateur possède déjà un restaurant
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { userId: userId },
    });

    if (existingRestaurant) {
      throw new ConflictError("Cet utilisateur possède déjà un restaurant");
    }

    const newRestaurant = await this.prisma.$transaction(async (prisma) => {
      const restaurant = await prisma.restaurant.create({
        data: {
          name: input.name,
          address: input.address,
          phoneNumber: input.phoneNumber,
          picture: input.picture || null,
          userId: userId,
        },
      });
      return restaurant;
    });

    return {
      id: newRestaurant.id,
    };
  };

  getMyRestaurant = async (userId: string) => {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { userId: userId },
    });

    if (!restaurant) {
      throw new UnauthorizedError("Restaurant non trouvé pour cet utilisateur");
    }

    return restaurant;
  };

  updateRestaurant = async (
    userId: string,
    data: Partial<CreateRestaurantInput>,
  ) => {
    const restaurant = await this.getMyRestaurant(userId);

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        picture: data.picture !== undefined ? data.picture : undefined,
      },
    });
    return updated;
  };
}
