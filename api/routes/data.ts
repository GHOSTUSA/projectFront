import { readFileSync } from "fs";
import { join } from "path";
import type { FastifyInstance } from "fastify";

export const dataRoutes = async (app: FastifyInstance) => {
  app.get("/data.json", async (request, reply) => {
    try {
      const filePath = join(
        process.cwd(),
        "front",
        "public",
        "api",
        "data.json",
      );
      const raw = readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);
      return reply.status(200).send(json);
    } catch (err) {
      app.log.error({ err, msg: "Unable to read data.json" });
      return reply
        .status(500)
        .send({ users: [], restaurants: [], commands: [] });
    }
  });
};

export default dataRoutes;
