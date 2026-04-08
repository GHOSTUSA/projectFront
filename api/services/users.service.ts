import { PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError, ConflictError } from "../common/exceptions.js";
import { hash } from "bcryptjs";

class UsersService {
  constructor(private prisma: PrismaClient) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateUser(id: string, data: { email?: string; password?: string }) {
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictError("Email already in use");
      }
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return user;
  }

  async deleteUser(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (e: any) {
      if (e.code === "P2025") {
        throw new NotFoundError("User not found");
      }
      throw e;
    }
  }
}

export default UsersService;
