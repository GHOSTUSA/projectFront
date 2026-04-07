import type { PrismaClient } from "../generated/prisma/client.js";
import { hash, compare } from "bcryptjs";
import { ConflictError, UnauthorizedError } from "../common/exceptions.js";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  role: string;
}

export default class AuthService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  register = async (input: RegisterInput): Promise<AuthResponse> => {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("L'utilisateur existe déjà");
    }

    const hashedPassword = await hash(input.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
  };

  login = async (input: LoginInput): Promise<AuthResponse> => {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError("Identifiants incorrects");
    }

    const isValidPassword = await compare(input.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Identifiants incorrects");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  };
}
