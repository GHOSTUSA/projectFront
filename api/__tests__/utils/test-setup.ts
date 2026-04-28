// Test server setup for integration tests
import { buildServer } from "../../index";
import type { FastifyInstance } from "fastify";

let server: FastifyInstance;

export async function createTestServer(): Promise<FastifyInstance> {
  server = buildServer();
  await server.register(require("@fastify/cors"), {});
  const { registerPlugins } = await import("../../plugins/index.js");
  const { registerGraphQL } = await import("../../graphql/index.js");
  const { registerRoutes } = await import("../../routes/index.js");
  await registerPlugins(server);
  await registerGraphQL(server);
  await registerRoutes(server);
  await server.ready();
  return server;
}

export async function closeTestServer(serverInstance?: FastifyInstance) {
  if (serverInstance) {
    await serverInstance.close();
  } else if (server) {
    await server.close();
  }
}
