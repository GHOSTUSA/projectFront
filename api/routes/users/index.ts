import { FastifyInstance } from "fastify/types/instance";
import UsersService from "../../services/users.service.js";
import {
  UpdateUserSchema,
  UpdateUserRequest,
} from "../../schemas/user.schema.js";

const userRoutes = async (app: FastifyInstance) => {
  const usersService = new UsersService(app.prisma);

  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const user = await usersService.getUserById(request.user.id);
      return reply.status(200).send(user);
    },
  );

  app.patch<{ Body: UpdateUserRequest }>(
    "/me",
    {
      schema: {
        body: UpdateUserSchema,
      },
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const user = await usersService.updateUser(request.user.id, request.body);
      return reply.status(200).send(user);
    },
  );

  app.delete(
    "/me",
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      await usersService.deleteUser(request.user.id);
      return reply.status(204).send();
    },
  );
};

export default userRoutes;
