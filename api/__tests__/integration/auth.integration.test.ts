import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { createTestServer, closeTestServer } from "../utils/test-setup";
import { prisma } from "../../plugins/prismaInstance";

// Tests d'intégration du service d'authentification

describe("Authentication Integration Tests", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(server);
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return a valid JWT token", async () => {
      const newUser = {
        email: "test@example.com",
        password: "password123",
      };
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: newUser,
      });
      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty("token");
      const token = response.json().token;
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe("test@example.com");
    });

    it("should reject registration with invalid email format", async () => {
      const invalidUser = {
        email: "invalid-email",
        password: "password123",
      };
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: invalidUser,
      });
      expect(response.statusCode).toBe(400);
      const user = await prisma.user.findUnique({
        where: { email: "invalid-email" },
      });
      expect(user).toBeNull();
    });

    it("should return 409 when email already exists", async () => {
      const userPayload = {
        email: "duplicate@example.com",
        password: "password123",
      };
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: userPayload,
      });
      const secondResponse = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          ...userPayload,
          password: "differentpassword",
        },
      });
      expect(secondResponse.statusCode).toBe(409);
      expect(secondResponse.json()).toHaveProperty("message");
      expect(secondResponse.json().message).toMatch(/conflict/i);
      const userCount = await prisma.user.count({
        where: { email: "duplicate@example.com" },
      });
      expect(userCount).toBe(1);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "login@example.com",
          password: "correctpassword",
        },
      });
    });

    it("should login with valid credentials and return JWT token", async () => {
      const credentials = {
        email: "login@example.com",
        password: "correctpassword",
      };
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: credentials,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("token");
      const token = response.json().token;
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });

    it("should return 401 for non-existent user", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "password123",
      };
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: credentials,
      });
      expect(response.statusCode).toBe(401);
    });
  });
});
