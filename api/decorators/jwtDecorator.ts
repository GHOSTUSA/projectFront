import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { UnauthorizedError, ForbiddenError } from "../common/exceptions.js";

export default fp(async function (fastify: FastifyInstance, options = {}) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  await fastify.register(fastifyJwt, {
    secret: jwtSecret,
  });

  fastify.decorate(
    "authenticate",
    async (req: FastifyRequest, res: FastifyReply) => {
      try {
        const decoded = await req.jwtVerify<{ id: string }>();
        const user = await fastify.prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true },
        });

        if (!user) {
          throw new UnauthorizedError("Utilisateur non trouvé");
        }

        req.user = user as typeof req.user;
      } catch (err: any) {
        if (err instanceof UnauthorizedError) throw err;
        throw new UnauthorizedError("Non autorisé");
      }
    },
  );

  fastify.decorate("authorize", (allowedRoles: string[]) => {
    return async (req: FastifyRequest, res: FastifyReply) => {
      await fastify.authenticate(req, res);

      const userRole = req.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new ForbiddenError("Accès refusé : Rôle insuffisant");
      }
    };
  });
});
