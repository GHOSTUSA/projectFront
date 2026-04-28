import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import mercurius from "mercurius";
import { restaurantSchema } from "./restaurant.schema.js";
import { createRestaurantResolvers } from "./restaurant.resolvers.js";

export const registerGraphQL = async (app: FastifyInstance) => {
  const resolvers = createRestaurantResolvers(app);

  await app.register(mercurius, {
    schema: restaurantSchema,
    resolvers,
    graphiql: true,
    context: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (request.headers.authorization) {
          await request.jwtVerify();
        }
      } catch (err) {
        // Le token est invalide ou expiré, fastify met alors request.user en undefined ou lève l'erreur
      }
      return {
        request,
        reply,
        user: request.user,
        prisma: app.prisma,
      };
    },
  });
};
