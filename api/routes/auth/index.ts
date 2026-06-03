import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify/types/instance";
import rateLimit from "@fastify/rate-limit";
import AuthService from "../../services/auth.service.js";
import {
  LoginSchema,
  RegisterSchema,
  TokenResponseSchema,
  type LoginRequest,
  type RegisterRequest,
} from "../../schemas/auth.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";
import { User } from "../../generated/prisma/client.js";

export const authRoutes = async (app: FastifyInstance) => {
  const authService = new AuthService(app.prisma);
  const { register, login, getAllUsers } = authService;

  // Rate limit spécifique à la route login : max 5 tentatives par minute par IP
  await app.register(rateLimit, {
    max: 5,
    timeWindow: "1 minute",
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (_request, context) => ({
      type: "urn:app:error:too-many-requests",
      title: "Too Many Requests",
      status: 429,
      detail: `Trop de tentatives de connexion. Réessayez dans ${Math.ceil(context.ttl / 1000)} secondes.`,
    }),
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
  });

  app.get("/", async (request, reply) => {
    const users = await getAllUsers();
    return reply.status(200).send(users);
  });

  app.post<{ Body: RegisterRequest }>(
    "/register",
    {
      schema: {
        body: RegisterSchema,
        response: {
          201: TokenResponseSchema,
          409: ErrorResponseSchema,
        },
      },
      config: { rateLimit: false }, // Pas de rate limit sur le register
    },
    async (request, reply) => {
      const user = await register(
        request.body as import("../../services/auth.service.js").RegisterInput,
      );
      const token = app.jwt.sign({ id: user.id });
      return reply.status(201).send({ token });
    },
  );

  app.post<{ Body: LoginRequest }>(
    "/login",
    {
      schema: {
        body: LoginSchema,
        response: {
          200: TokenResponseSchema,
          401: ErrorResponseSchema,
        },
      },
      // Le rate limit s'applique ici (5 max / minute par défaut du plugin)
    },
    async (request, reply) => {
      const user = await login(request.body);
      const token = app.jwt.sign({ id: user.id });
      return reply.status(200).send({ token });
    },
  );

  app.get(
    "/me",
    {
      schema: {
        response: {
          200: Type.Unsafe<Omit<User, "password">>(),
        },
      },
      onRequest: [app.authenticate],
      config: { rateLimit: false },
    },
    async (request, reply) => {
      return request.user;
    },
  );
};
